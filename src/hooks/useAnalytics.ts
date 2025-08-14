import { useEffect, useRef } from 'react';
import { analyticsService } from '../lib/analyticsService';

export const useAnalytics = () => {
  return {
    trackPageView: (pagePath?: string) => {
      const path = pagePath || (typeof window !== 'undefined' ? window.location.pathname : '');
      analyticsService.trackPageView(path);
    },
    
    trackClick: (elementId: string, elementType: string) => {
      analyticsService.trackClick(elementId, elementType);
    },
    
    trackChatMessage: (messageLength: number, isUser: boolean) => {
      analyticsService.trackChatMessage(messageLength, isUser);
    },
    
    trackFeatureUse: (featureName: string, additionalData?: Record<string, unknown>) => {
      const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
      analyticsService.trackFeatureUse(featureName, pagePath, additionalData);
    },
    
    trackError: (error: Error) => {
      const pagePath = typeof window !== 'undefined' ? window.location.pathname : '';
      analyticsService.trackError(error, pagePath);
    },
  };
};

// ページビュー自動追跡フック
export const usePageTracking = () => {
  const { trackPageView } = useAnalytics();
  const hasTrackedInitial = useRef(false);

  useEffect(() => {
    // 初回ページロード時の追跡
    if (!hasTrackedInitial.current) {
      trackPageView();
      hasTrackedInitial.current = true;
    }
  }, [trackPageView]);
};

// クリック追跡用のカスタムフック
export const useClickTracking = () => {
  const { trackClick } = useAnalytics();
  
  const handleTrackedClick = (elementId: string, elementType: string, callback?: () => void) => {
    return () => {
      trackClick(elementId, elementType);
      callback?.();
    };
  };

  return { handleTrackedClick };
};

// エラー境界で使用するエラー追跡フック
export const useErrorTracking = () => {
  const { trackError } = useAnalytics();
  
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message));
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [trackError]);
};