// lib/dify.ts
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成';

export const sendMessageToDify = async (prompt: string, mode: ModeType = '通常') => {
  console.log('sendMessageToDify called:', { mode, promptLength: prompt.length });
  
  try {
    // モバイル環境の検出
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const timeoutMs = isMobile ? 60000 : 30000; // モバイルは60秒、デスクトップは30秒
    
    console.log('Network request starting:', { isMobile, timeoutMs });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const res = await fetch('/api/dify-proxy', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': isMobile ? 'Mobile-Browser' : 'Desktop-Browser'
      },
      body: JSON.stringify({ prompt, mode }),
      signal: controller.signal,
      // モバイル向けの追加オプション
      keepalive: true,
      cache: 'no-cache',
    });
    
    clearTimeout(timeoutId);

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
