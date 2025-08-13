import { NextRequest, NextResponse } from 'next/server';
import { logApiKeyStatus } from '../../../utils/envCheck';

type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

// モードに対応するAPI Keyを取得する関数
function getApiKey(mode: ModeType): string {
  switch (mode) {
    case '通常':
      return process.env.DIFY_API_KEY_NORMAL || '';
    case '脳血管':
      return process.env.DIFY_API_KEY_CEREBROVASCULAR || '';
    case '感染マニュアル':
      return process.env.DIFY_API_KEY_INFECTION || '';
    case '議事録作成':
      return process.env.DIFY_API_KEY_MINUTES || '';
    case '文献検索':
      return process.env.DIFY_API_KEY_LITERATURE || '';
    default:
      return process.env.DIFY_API_KEY_NORMAL || '';
  }
}

export async function POST(req: NextRequest) {
  console.log('=== DIFY PROXY API CALL ===');
  
  // 環境変数の設定状況をログ出力
  logApiKeyStatus();
  
  // 変数をtry文の外で宣言
  let requestData: { prompt?: string; mode?: string } | null = null;
  let audioFile: File | null = null;
  let mode: string = '通常';
  let prompt: string = '';
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    // リクエストヘッダーから情報を取得
    const userAgent = req.headers.get('user-agent') || '';
    const isMobileRequest = req.headers.get('x-mobile-request') === 'true' || 
                           /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    console.log('Request info:', {
      userAgent: userAgent.slice(0, 100),
      isMobile: isMobileRequest,
      contentType: req.headers.get('content-type'),
      origin: req.headers.get('origin')
    });
    
    // Content-Type確認してリクエストを適切に処理
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // FormDataの場合（音声ファイル付き）
      try {
        const formData = await req.formData();
        prompt = formData.get('prompt') as string;
        mode = formData.get('mode') as string || '通常';
        const audioFileEntry = formData.get('audioFile') as File;
        
        requestData = { prompt, mode };
        audioFile = audioFileEntry;
        
        console.log('FormData received:', {
          hasPrompt: !!prompt,
          hasAudioFile: !!audioFile,
          audioFileName: audioFile?.name,
          audioFileSize: audioFile?.size
        });
      } catch (error) {
        console.error('Failed to parse FormData:', error);
        return NextResponse.json(
          { error: 'Invalid FormData in request body' }, 
          { status: 400 }
        );
      }
          } else {
        // JSONの場合（テキストのみ）
        try {
          const jsonData = await req.json();
          requestData = jsonData;
          prompt = jsonData.prompt || '';
          mode = jsonData.mode || '通常';
        } catch (error) {
        console.error('Failed to parse request JSON:', error);
        return NextResponse.json(
          { error: 'Invalid JSON in request body' }, 
          { status: 400 }
        );
      }
    }
    console.log('Request data:', { promptLength: prompt?.length, mode });
    
    const apiKey = getApiKey(mode as ModeType);
    console.log('API Key status:', { 
      mode, 
      hasKey: !!apiKey, 
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'NONE',
      allEnvVars: {
        DIFY_API_KEY_NORMAL: !!process.env.DIFY_API_KEY_NORMAL,
        DIFY_API_KEY_CEREBROVASCULAR: !!process.env.DIFY_API_KEY_CEREBROVASCULAR,
        DIFY_API_KEY_INFECTION: !!process.env.DIFY_API_KEY_INFECTION,
        DIFY_API_KEY_MINUTES: !!process.env.DIFY_API_KEY_MINUTES,
        DIFY_API_KEY_LITERATURE: !!process.env.DIFY_API_KEY_LITERATURE
      }
    });
    
    if (!apiKey) {
      console.error('Missing API key for mode:', mode);
      
      // 開発環境での一時的なモックレスポンス
      if (process.env.NODE_ENV === 'development') {
        console.warn('Development mode: returning mock response');
        return NextResponse.json({ 
          answer: `[開発モード] ${mode}モードのAPIキーが設定されていません。実際のAPIキーを設定するか、本番環境でテストしてください。\n\n設定が必要な環境変数: DIFY_API_KEY_${mode.toUpperCase().replace(' ', '_')}`,
          debug: {
            mode,
            availableKeys: {
              normal: !!process.env.DIFY_API_KEY_NORMAL,
              cerebrovascular: !!process.env.DIFY_API_KEY_CEREBROVASCULAR,
              infection: !!process.env.DIFY_API_KEY_INFECTION,
              minutes: !!process.env.DIFY_API_KEY_MINUTES,
              literature: !!process.env.DIFY_API_KEY_LITERATURE
            },
            message: '環境変数にAPIキーが設定されていません。.env.localファイルにDify APIキーを設定してください。'
          }
        });
      }
      
      return NextResponse.json({ 
        error: `API Key not configured for mode: ${mode}`,
        debug: {
          mode,
          availableKeys: {
            normal: !!process.env.DIFY_API_KEY_NORMAL,
            cerebrovascular: !!process.env.DIFY_API_KEY_CEREBROVASCULAR,
            infection: !!process.env.DIFY_API_KEY_INFECTION,
            minutes: !!process.env.DIFY_API_KEY_MINUTES,
            literature: !!process.env.DIFY_API_KEY_LITERATURE
          },
          message: '環境変数にAPIキーが設定されていません。.env.localファイルにDify APIキーを設定してください。'
        }
      }, { status: 500 });
    }

    // タイムアウト設定（文献検索モードは5分、他は従来通り）
    const timeoutMs = mode === '文献検索' ? 300000 : 120000; // 文献検索は5分、他は2分
    const controller = new AbortController();
    timeoutId = setTimeout(() => {
      console.log(`Request timeout after ${timeoutMs}ms (${timeoutMs / 60000} minutes) for mode: ${mode}`);
      controller.abort();
    }, timeoutMs);
    
    let res;
    
    if (audioFile) {
      // 音声ファイルがある場合：議事録作成モードはワークフロー、他はチャット
      console.log('Processing audio file with Dify...');
      
      if (mode === '議事録作成') {
        // 議事録作成モード：ワークフローAPIを使用（ファイルを直接送信）
        console.log('Using workflow API for minutes creation...');
        
        // ワークフローAPIでファイルを直接送信（FormData形式）
        const workflowFormData = new FormData();
        workflowFormData.append('audio', audioFile);  // ファイルを直接添付
        workflowFormData.append('response_mode', 'blocking');
        workflowFormData.append('user', isMobileRequest ? 'mobile-user' : 'desktop-user');
        
        const workflowHeaders = {
          Authorization: `Bearer ${apiKey}`,
          ...(isMobileRequest && { 'X-Request-Source': 'mobile' })
          // Content-Typeは自動設定される（multipart/form-data）
        };
        
        console.log('Making Dify workflow API call with FormData...', {
          url: 'https://api.dify.ai/v1/workflows/run',
          audioFileName: audioFile.name,
          audioFileSize: audioFile.size,
          audioFileType: audioFile.type
        });
        
        res = await fetch('https://api.dify.ai/v1/workflows/run', {
          method: 'POST',
          headers: workflowHeaders,
          body: workflowFormData,
          signal: controller.signal,
        });
      } else {
        // 他のモード：従来のチャットAPI
        console.log('Using chat API for other modes...');
        
        // Step 1: ファイルアップロード
        const uploadFormData = new FormData();
        uploadFormData.append('file', audioFile);
        uploadFormData.append('user', isMobileRequest ? 'mobile-user' : 'desktop-user');
        uploadFormData.append('source', 'api');
        
        const uploadHeaders = {
          Authorization: `Bearer ${apiKey}`,
          ...(isMobileRequest && { 'X-Request-Source': 'mobile' })
        };
        
        const uploadRes = await fetch('https://api.dify.ai/v1/files/upload', {
          method: 'POST',
          headers: uploadHeaders,
          body: uploadFormData,
          signal: controller.signal,
        });
        
        if (!uploadRes.ok) {
          const uploadError = await uploadRes.text();
          console.error('File upload failed:', {
            status: uploadRes.status,
            statusText: uploadRes.statusText,
            error: uploadError
          });
          throw new Error(`File upload failed: ${uploadRes.status} - ${uploadError}`);
        }
        
        const uploadResult = await uploadRes.json();
        console.log('File upload successful for chat API:', {
          id: uploadResult.id,
          name: uploadResult.name
        });
        
        // Step 2: チャットAPIでファイルを処理
        const difyHeaders = {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...(isMobileRequest && { 'X-Request-Source': 'mobile' })
        };
        
        const difyBody = {
          inputs: {
            voice: uploadResult.id
          },
          response_mode: 'blocking',
          user: isMobileRequest ? 'mobile-user' : 'desktop-user'
        };
        
        res = await fetch('https://api.dify.ai/v1/chat-messages', {
          method: 'POST',
          headers: difyHeaders,
          body: JSON.stringify(difyBody),
          signal: controller.signal,
        });
      }
    } else {
      // テキストのみの場合
      // 議事録作成モードは音声ファイルが必須
      if (mode === '議事録作成') {
        throw new Error('議事録作成モードでは音声ファイルが必要です。音声ファイルをアップロードしてください。');
      }
      
      // 他のモード：従来通りJSON
      const difyHeaders = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(isMobileRequest && { 'X-Request-Source': 'mobile' })
      };
      
      const difyBody = {
        query: prompt,
        inputs: {},
        response_mode: 'blocking',
        user: isMobileRequest ? 'mobile-user' : 'desktop-user',
      };
      
      console.log('Making Dify API call (text only)...', {
        url: 'https://api.dify.ai/v1/chat-messages',
        bodySize: JSON.stringify(difyBody).length,
        isMobile: isMobileRequest,
        mode: mode,
        timeoutMs: timeoutMs
      });
      
      res = await fetch('https://api.dify.ai/v1/chat-messages', {
        method: 'POST',
        headers: difyHeaders,
        body: JSON.stringify(difyBody),
        signal: controller.signal,
      });
    }
    
    // タイムアウトをクリア
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const raw = await res.text();
    const responseContentType = res.headers.get('content-type') ?? '';

    console.log('Dify API response details:', {
      status: res.status,
      statusText: res.statusText,
      contentType: responseContentType,
      responseLength: raw.length,
      responsePreview: raw.slice(0, 500)
    });

    if (!res.ok || !responseContentType.includes('application/json')) {
      console.error('Dify API error response:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: raw
      });
      throw new Error(`Dify responded with ${res.status}: ${raw.slice(0, 200)}`);
    }

    const data = JSON.parse(raw);
    
    // レスポンス形式の判定：ワークフローAPIとチャットAPIで異なる
    let answer;
    if (mode === '議事録作成' && audioFile) {
      // ワークフローAPIの場合
      if (data.data && data.data.outputs) {
        // ワークフローの出力から議事録を取得
        answer = data.data.outputs.text || data.data.outputs.minutes || data.data.outputs.result || data.data.outputs.output || '議事録の生成に失敗しました。';
        console.log('Workflow response:', {
          hasOutputs: !!data.data.outputs,
          outputKeys: Object.keys(data.data.outputs || {}),
          answerLength: answer.length,
          fullData: data
        });
      } else {
        console.error('Unexpected workflow response format:', data);
        answer = 'ワークフローの応答形式が予期されていません。レスポンス: ' + JSON.stringify(data).slice(0, 200);
      }
    } else {
      // チャットAPIの場合
      answer = data.answer ?? '(回答が空でした)';
      console.log('Chat response successful:', { hasAnswer: !!answer, answerLength: answer.length });
    }
    
    return NextResponse.json({ answer });
  } catch (error) {
    // エラー時もタイムアウトをクリア
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    console.error('=== DIFY PROXY ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Request details:', {
      hasAudioFile: !!audioFile,
      audioFileName: audioFile?.name,
      audioFileSize: audioFile?.size,
      mode,
      promptLength: prompt?.length
    });
    console.error('=== END DIFY PROXY ERROR ===');
    
    // より詳細なエラーメッセージを提供
    let userFriendlyError = 'サーバーエラーが発生しました。';
    
    if (error instanceof Error) {
      if (error.message.includes('File upload failed')) {
        userFriendlyError = '音声ファイルのアップロードに失敗しました。ファイル形式またはサイズを確認してください。';
      } else if (error.message.includes('415')) {
        userFriendlyError = 'ファイル形式がサポートされていません。MP3、WAV、M4A、OGGファイルをお試しください。';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        userFriendlyError = 'API認証に失敗しました。管理者にお問い合わせください。';
      } else if (error.message.includes('timeout')) {
        userFriendlyError = 'リクエストがタイムアウトしました。しばらく待ってから再度お試しください。';
      }
    }
    
    return NextResponse.json({ 
      error: userFriendlyError,
      technical_error: String(error),
      debug: {
        errorType: typeof error,
        hasAudioFile: !!audioFile,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
