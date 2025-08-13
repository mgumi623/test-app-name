// lib/dify.ts
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成';

export const sendMessageToDify = async (prompt: string, mode: ModeType = '通常') => {
  const res = await fetch('/api/dify-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, mode }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy error: ${res.status}\n${text.slice(0, 100)}`);
  }

  return res.json(); // { answer: string }
};
