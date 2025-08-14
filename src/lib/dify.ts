// lib/dify.ts
export type ModeType = '通常' | '脳血管' | '感染マニュアル' | '議事録作成' | '文献検索';

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

export const sendMessageToDify = async (prompt: string, mode: ModeType = '通常', audioFile?: File) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('sendMessageToDify called:', { mode, promptLength: prompt.length });
  }
  
  try {
    // モバイル環境の検出
    const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // タイムアウト設定（文献検索モードは5分、他は従来通り）
    let timeoutMs: number;
    if (mode === '文献検索') {
      timeoutMs = 300000; // 5分（300秒）
    } else {
      timeoutMs = isMobile ? 90000 : 30000; // モバイルは90秒、デスクトップは30秒
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Network request starting:', { mode, timeoutMs });
    }
    
    // リクエストボディの準備
    let fetchOptions: RequestInit;
    
    if (audioFile) {
      // 音声ファイルがある場合：FormData
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('mode', mode);
      formData.append('audioFile', audioFile);
      
      fetchOptions = {
        method: 'POST',
        headers: {
          ...(isMobile && { 'X-Mobile-Request': 'true' })
          // Content-Typeは自動設定される（multipart/form-data）
        },
        body: formData,
        cache: 'no-cache',
      };
    } else {
      // テキストのみの場合：JSON
      fetchOptions = {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(isMobile && { 'X-Mobile-Request': 'true' })
        },
        body: JSON.stringify({ prompt, mode }),
        cache: 'no-cache',
      };
    }
    
    try {
      const controller = new AbortController();
      let timeoutId: NodeJS.Timeout;

      const wrappedFetch = async () => {
        try {
          fetchOptions.signal = controller.signal;
          const response = await fetchWithRetry('/api/dify-proxy', fetchOptions, 3);
          clearTimeout(timeoutId);
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new Error('応答時間が長すぎます。もう一度お試しください。'));
        }, 60000); // 1分のタイムアウト
      });

      const res = await Promise.race([wrappedFetch(), timeoutPromise]) as Response;
      return await handleResponse(res);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request aborted:', error.message);
          throw new Error('応答時間が長すぎます。もう一度お試しください。');
        }
        console.error('Network error:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else {
        console.error('Unknown error:', error);
      }
      throw error;
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
      let errorData: { error?: string } | null = null;
      
      try {
        errorText = await res.text();
        // JSONとして解析を試行
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // JSONでない場合はテキストとして扱う
        }
      } catch {
        errorText = 'Failed to read error response';
      }
      
      console.error('Dify proxy error details:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: errorText.slice(0, 200),
        errorData
      });
      
      // APIキーエラーの場合は特別なメッセージ
      if (errorData?.error?.includes('API Key not configured')) {
        throw new Error('APIキーが設定されていません。管理者にお問い合わせください。');
      }
      
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
