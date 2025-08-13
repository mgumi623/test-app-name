// lib/dify.ts
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成';

// 再試行機能付きのfetch関数
const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries}`);
      const response = await fetch(url, options);
      
      if (!response.ok && attempt < maxRetries) {
        console.warn(`Attempt ${attempt} failed with status ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 段階的遅延
        continue;
      }
      
      return response;
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
    }
  }
  
  throw lastError || new Error('All fetch attempts failed');
};

export const sendMessageToDify = async (prompt: string, mode: ModeType = '通常') => {
  console.log('sendMessageToDify called:', { mode, promptLength: prompt.length });
  
  try {
    // モバイル環境の検出
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const timeoutMs = isMobile ? 90000 : 30000; // モバイルは90秒に延長
    
    console.log('Network request starting:', { 
      isMobile, 
      timeoutMs, 
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      online: typeof navigator !== 'undefined' ? navigator.onLine : true
    });
    
    // モバイル向けの最適化されたオプション
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(isMobile && { 'X-Mobile-Request': 'true' })
      },
      body: JSON.stringify({ prompt, mode }),
      cache: 'no-cache',
    };
    
    // タイムアウト制御（モバイルではAbortControllerを使わない場合もある）
    if (!isMobile || 'AbortController' in window) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timeout, aborting...');
        controller.abort();
      }, timeoutMs);
      
      fetchOptions.signal = controller.signal;
      
      try {
        const res = await fetchWithRetry('/api/dify-proxy', fetchOptions, isMobile ? 2 : 1);
        clearTimeout(timeoutId);
        return await handleResponse(res);
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } else {
      // フォールバック: AbortControllerがない古いブラウザ向け
      console.log('Using fallback fetch without AbortController');
      const res = await fetchWithRetry('/api/dify-proxy', fetchOptions, 1);
      return await handleResponse(res);
    }
  } catch (error) {
    console.error('sendMessageToDify error:', {
      error: error instanceof Error ? error.message : String(error),
      mode,
      promptLength: prompt.length,
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// レスポンス処理を分離
const handleResponse = async (res: Response) => {
  try {
    if (!res.ok) {
      let errorText = '';
      try {
        errorText = await res.text();
      } catch (e) {
        errorText = 'Failed to read error response';
      }
      
      console.error('Dify proxy error details:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: errorText.slice(0, 200)
      });
      
      throw new Error(`HTTP ${res.status}: ${res.statusText} - ${errorText.slice(0, 100)}`);
    }

    let data;
    try {
      data = await res.json();
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error('Invalid JSON response from server');
    }
    
    console.log('Dify response received:', { 
      hasAnswer: !!data.answer, 
      answerLength: data.answer?.length || 0,
      responseKeys: Object.keys(data)
    });
    
    return data; // { answer: string }
  } catch (error) {
    console.error('handleResponse error:', error);
    throw error;
  }
};
