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
    const { prompt, mode = '通常' } = await req.json();
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

    const res = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // ✅ query をトップレベルに
        query: prompt,
        inputs: {},                 // 追加フィールドを定義していなければ空で OK
        response_mode: 'blocking',  // すぐ返す
        user: 'user-001',
      }),
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
