// モバイル向けユーティリティ関数

// モバイル環境の詳細検出
export const getMobileInfo = () => {
  if (typeof window === 'undefined') return { isMobile: false };
  
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  
  return {
    isMobile,
    isIOS,
    isAndroid,
    userAgent: userAgent.slice(0, 100),
    online: navigator.onLine,
    connection: (navigator as { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
    platform: navigator.platform || 'unknown'
  };
};

// モバイル向けのfetch設定
export const getMobileFetchConfig = () => {
  const mobileInfo = getMobileInfo();
  
  if (!mobileInfo.isMobile) {
    return {
      timeout: 30000,
      retries: 1,
      retryDelay: 1000
    };
  }
  
  // モバイル環境での設定
  return {
    timeout: mobileInfo.connection === 'slow-2g' || mobileInfo.connection === '2g' ? 120000 : 90000,
    retries: 3,
    retryDelay: 2000
  };
};

// ネットワーク状態のチェック
export const checkNetworkStatus = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.onLine) {
      resolve(false);
      return;
    }
    
    // 簡単な接続テスト
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    // 小さな画像でテスト（Vercelのfavicon）
    img.src = '/favicon.ico?' + Date.now();
  });
};

// エラーの種類を判定
export const categorizeError = (error: unknown) => {
  if (!error) return 'unknown';
  
  const errorString = String(error).toLowerCase();
  const errorMessage = (error as Error)?.message?.toLowerCase() || '';
  
  if ((error as Error)?.name === 'AbortError' || errorString.includes('abort')) {
    return 'timeout';
  }
  
  if (errorString.includes('network') || errorString.includes('fetch')) {
    return 'network';
  }
  
  if (errorString.includes('json') || errorString.includes('parse')) {
    return 'parse';
  }
  
  if (errorString.includes('api key') || errorString.includes('unauthorized')) {
    return 'auth';
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('server')) {
    return 'server';
  }
  
  return 'unknown';
};

// モバイル向けのエラーメッセージ
export const getMobileErrorMessage = (errorCategory: string) => {
  const messages = {
    timeout: 'ネットワークの接続が不安定です。しばらく待ってから再度お試しください。',
    network: 'インターネット接続を確認してから再度お試しください。',
    parse: 'サーバーからの応答に問題があります。しばらく待ってから再度お試しください。',
    auth: 'システムの認証に問題があります。管理者にお問い合わせください。',
    server: 'サーバーに一時的な問題があります。しばらく待ってから再度お試しください。',
    unknown: '予期しないエラーが発生しました。しばらく待ってから再度お試しください。'
  };
  
  return messages[errorCategory as keyof typeof messages] || messages.unknown;
};