import { supabase } from './supabase';

export interface AnalyticsSession {
  id?: string;
  user_id?: string;
  user_permission?: string;
  session_id: string;
  start_time?: string;
  end_time?: string;
  duration_seconds?: number;
  page_views?: number;
  device_type?: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
}

export interface AnalyticsEvent {
  session_id: string;
  user_id?: string;
  user_permission?: string;
  event_type: 'page_view' | 'click' | 'chat_message' | 'feature_use' | 'error';
  page_path?: string;
  element_id?: string;
  element_type?: string;
  event_data?: Record<string, any>;
}

export interface AnalyticsError {
  session_id: string;
  user_id?: string;
  user_permission?: string;
  error_type: string;
  error_message?: string;
  stack_trace?: string;
  page_path?: string;
  user_agent?: string;
}

class AnalyticsService {
  private currentSessionId: string = '';
  private sessionStartTime: Date = new Date();
  private pageViews: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentSessionId = this.generateSessionId();
      this.initializeSession();
      this.setupUnloadListener();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'server';
    
    const width = window.innerWidth;
    if (width <= 768) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  private async initializeSession() {
    try {
      const sessionData: AnalyticsSession = {
        session_id: this.currentSessionId,
        start_time: this.sessionStartTime.toISOString(),
        device_type: this.getDeviceType(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || undefined,
        page_views: 0,
      };

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        sessionData.user_id = userData.user.id;
        // ユーザーのpermission情報を取得（複数の場所をチェック）
        const permission = 
          userData.user.user_metadata?.permission ||
          (userData.user as any).raw_user_meta_data?.permission ||
          'unknown';
        sessionData.user_permission = permission as string;
        
        // デバッグログ
        console.log('Analytics Session - User permission:', permission);
        console.log('Analytics Session - User metadata:', userData.user.user_metadata);
        console.log('Analytics Session - Raw user meta data:', (userData.user as any).raw_user_meta_data);
      }

      const { error } = await supabase
        .from('analytics_sessions')
        .insert([sessionData]);

      if (error) {
        console.error('Failed to initialize analytics session:', error);
      }
    } catch (error) {
      console.error('Analytics initialization error:', error);
    }
  }

  private setupUnloadListener() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  async trackPageView(pagePath: string) {
    this.pageViews++;
    await this.trackEvent({
      session_id: this.currentSessionId,
      event_type: 'page_view',
      page_path: pagePath,
    });

    // セッションのページビュー数を更新
    await this.updateSessionPageViews();
  }

  async trackClick(elementId: string, elementType: string, pagePath?: string) {
    await this.trackEvent({
      session_id: this.currentSessionId,
      event_type: 'click',
      page_path: pagePath || window.location.pathname,
      element_id: elementId,
      element_type: elementType,
    });
  }

  async trackChatMessage(messageLength: number, isUser: boolean) {
    await this.trackEvent({
      session_id: this.currentSessionId,
      event_type: 'chat_message',
      page_path: '/AIchat',
      event_data: {
        message_length: messageLength,
        sender: isUser ? 'user' : 'ai',
        timestamp: new Date().toISOString(),
      },
    });
  }

  async trackFeatureUse(featureName: string, pagePath: string, additionalData?: Record<string, any>) {
    await this.trackEvent({
      session_id: this.currentSessionId,
      event_type: 'feature_use',
      page_path: pagePath,
      event_data: {
        feature_name: featureName,
        ...additionalData,
      },
    });
  }

  async trackError(error: Error, pagePath?: string) {
    try {
      const errorData: AnalyticsError = {
        session_id: this.currentSessionId,
        error_type: error.name || 'Unknown Error',
        error_message: error.message,
        stack_trace: error.stack,
        page_path: pagePath || (typeof window !== 'undefined' ? window.location.pathname : ''),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        errorData.user_id = userData.user.id;
        errorData.user_permission = (userData.user.user_metadata?.permission as string) || 
          ((userData.user as any).raw_user_meta_data?.permission as string) || 'unknown';
      }

      const { error: dbError } = await supabase
        .from('analytics_errors')
        .insert([errorData]);

      if (dbError) {
        console.error('Failed to track error:', dbError);
      }
    } catch (trackingError) {
      console.error('Error tracking failed:', trackingError);
    }
  }

  private async trackEvent(event: AnalyticsEvent) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        event.user_id = userData.user.id;
        const permission = 
          userData.user.user_metadata?.permission ||
          (userData.user as any).raw_user_meta_data?.permission ||
          'unknown';
        event.user_permission = permission as string;
        
        // デバッグログ
        console.log('Analytics Event - User permission:', permission, 'Event type:', event.event_type);
      }

      const { error } = await supabase
        .from('analytics_events')
        .insert([event]);

      if (error) {
        console.error('Failed to track event:', error);
      }
    } catch (error) {
      console.error('Event tracking error:', error);
    }
  }

  private async updateSessionPageViews() {
    try {
      const { error } = await supabase
        .from('analytics_sessions')
        .update({ page_views: this.pageViews })
        .eq('session_id', this.currentSessionId);

      if (error) {
        console.error('Failed to update session page views:', error);
      }
    } catch (error) {
      console.error('Session update error:', error);
    }
  }

  async endSession() {
    try {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - this.sessionStartTime.getTime()) / 1000);

      const { error } = await supabase
        .from('analytics_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: duration,
          page_views: this.pageViews,
        })
        .eq('session_id', this.currentSessionId);

      if (error) {
        console.error('Failed to end session:', error);
      }
    } catch (error) {
      console.error('Session end error:', error);
    }
  }

  // 管理ダッシュボード用のデータ取得メソッド
  async getAnalyticsSummary() {
    try {
      const [sessionsRes, eventsRes, errorsRes] = await Promise.all([
        supabase
          .from('analytics_sessions')
          .select('*')
          .order('start_time', { ascending: false }),
        supabase
          .from('analytics_events')
          .select('*')
          .order('timestamp', { ascending: false }),
        supabase
          .from('analytics_errors')
          .select('*')
          .order('timestamp', { ascending: false }),
      ]);

      return {
        sessions: sessionsRes.data || [],
        events: eventsRes.data || [],
        errors: errorsRes.data || [],
      };
    } catch (error) {
      console.error('Failed to fetch analytics summary:', error);
      return { sessions: [], events: [], errors: [] };
    }
  }
}

export const analyticsService = new AnalyticsService();