import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  try {
    const res = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DIFY_API_KEY}`, // .env.local に app-xxxx
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
