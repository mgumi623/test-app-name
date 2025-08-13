import { NextRequest, NextResponse } from 'next/server';

type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成';

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
    default:
      return process.env.DIFY_API_KEY_NORMAL || '';
  }
}

export async function POST(req: NextRequest) {
  console.log('=== DIFY PROXY API CALL ===');
  
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
    
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Failed to parse request JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' }, 
        { status: 400 }
      );
    }
    
    const { prompt, mode = '通常' } = requestData;
    console.log('Request data:', { promptLength: prompt?.length, mode });
    
    const apiKey = getApiKey(mode as ModeType);
    console.log('API Key status:', { 
      mode, 
      hasKey: !!apiKey, 
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'NONE'
    });
    
    if (!apiKey) {
      console.error('Missing API key for mode:', mode);
      return NextResponse.json({ 
        error: `API Key not configured for mode: ${mode}`,
        debug: {
          mode,
          availableKeys: {
            normal: !!process.env.DIFY_API_KEY_NORMAL,
            cerebrovascular: !!process.env.DIFY_API_KEY_CEREBROVASCULAR,
            infection: !!process.env.DIFY_API_KEY_INFECTION,
            minutes: !!process.env.DIFY_API_KEY_MINUTES
          }
        }
      }, { status: 500 });
    }

    // モバイル向けのDify API呼び出し設定
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
    
    console.log('Making Dify API call...', {
      url: 'https://api.dify.ai/v1/chat-messages',
      bodySize: JSON.stringify(difyBody).length,
      isMobile: isMobileRequest
    });
    
    const res = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: difyHeaders,
      body: JSON.stringify(difyBody),
    });

    const raw = await res.text();
    const contentType = res.headers.get('content-type') ?? '';

    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error(`Dify responded with ${res.status}: ${raw.slice(0, 200)}`);
    }

    const data = JSON.parse(raw);
    const answer = data.answer ?? '(回答が空でした)';
    console.log('Dify response successful:', { hasAnswer: !!answer, answerLength: answer.length });
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('=== DIFY PROXY ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('=== END DIFY PROXY ERROR ===');
    
    return NextResponse.json({ 
      error: String(error),
      debug: {
        errorType: typeof error,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
