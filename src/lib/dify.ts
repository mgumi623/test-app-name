// lib/dify.ts
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成';

export const sendMessageToDify = async (prompt: string, mode: ModeType = '通常') => {
  try {
    const res = await fetch('/api/dify-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode }),
      // タブレット環境での接続改善のためのオプション
      signal: AbortSignal.timeout(30000), // 30秒タイムアウト
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Dify proxy error details:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: text
      });
      throw new Error(`Proxy error: ${res.status} - ${text.slice(0, 200)}`);
    }

    const data = await res.json();
    console.log('Dify response received:', { hasAnswer: !!data.answer, mode });
    return data; // { answer: string }
  } catch (error) {
    console.error('sendMessageToDify error:', {
      error: error instanceof Error ? error.message : String(error),
      mode,
      promptLength: prompt.length
    });
    throw error;
  }
};
