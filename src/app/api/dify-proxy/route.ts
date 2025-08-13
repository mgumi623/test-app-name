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
  const { prompt, mode = '通常' } = await req.json();

  try {
    const apiKey = getApiKey(mode as ModeType);
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: `API Key not configured for mode: ${mode}` 
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
    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
