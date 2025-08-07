// lib/dify.ts
export const sendMessageToDify = async (prompt: string) => {
  const res = await fetch('/api/dify-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Proxy error: ${res.status}\n${text.slice(0, 100)}`);
  }

  return res.json(); // { answer: string }
};
