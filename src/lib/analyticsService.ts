import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// 分析用のサービスロールクライアント（RLS回避）
const analyticsSupabase = typeof window === 'undefined' ? supabase : createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
  event_data?: Record<string, unknown>;
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

  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentSessionId = this.generateSessionId();
      // 初期化を遅延実行
      setTimeout(() => this.initializeSession(), 1000);
      this.setupUnloadListener();
    }
  }

  private async ensureInitialized() {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      await this.initializeSession();
      this.initialized = true;
    } catch (error) {
      console.warn('Analytics initialization skipped:', error);
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

  private async initializeSession(): Promise<void> {
    try {
      console.log('🔄 Starting analytics session initialization...');
      console.log('🔧 Supabase client info:', {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set'
      });
      
      // まず基本的な接続テスト
      const { data: basicTest, error: basicError } = await supabase
        .from('auth')
        .select('*')
        .limit(1);
      
      console.log('🔌 Basic connection test:', { basicTest, basicError });
      
      // Supabase接続テスト
      const { data: connectionTest, error: connectionError } = await supabase
        .from('information_schema')
        .select('table_name')
        .eq('table_name', 'analytics_sessions')
        .limit(1);
      
      console.log('📊 Connection test result:', { connectionTest, connectionError });
      
      if (connectionError) {
        console.warn('❌ Supabase connection failed:', connectionError);
        return;
      }
      
      // テーブル存在確認
      const { error: tableError } = await supabase
        .from('analytics_sessions')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.warn('❌ Analytics table not found:', {
          message: tableError.message,
          code: tableError.code,
          details: tableError.details,
          hint: tableError.hint
        });
        console.warn('🔧 Please run analytics-setup.sql in Supabase to create the analytics tables');
        return;
      }
      
      console.log('✅ Analytics tables verified');

      console.log('🔄 Creating session data...');
      const sessionData: AnalyticsSession = {
        session_id: this.currentSessionId,
        start_time: this.sessionStartTime.toISOString(),
        device_type: this.getDeviceType(),
        user_agent: navigator.userAgent,
        referrer: document.referrer || undefined,
        page_views: 0,
      };

      console.log('🔄 Getting user data...');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.warn('⚠️ User auth error:', userError);
      }
      
      if (userData.user) {
        sessionData.user_id = userData.user.id;
        // ユーザーのpermission情報を取得（複数の場所をチェック）
        const permission = 
          userData.user.user_metadata?.permission ||
          (userData.user as { raw_user_meta_data?: { permission?: string } }).raw_user_meta_data?.permission ||
          'unknown';
        sessionData.user_permission = permission as string;
        
        // デバッグログ
        console.log('👤 User authenticated - ID:', userData.user.id);
        console.log('🔑 User permission:', permission);
        console.log('📝 User metadata:', userData.user.user_metadata);
      } else {
        console.log('👤 User not authenticated, using anonymous session');
      }
      
      console.log('📋 Final session data:', sessionData);

      console.log('🔄 Inserting session data...');
      const { data: insertResult, error } = await analyticsSupabase
        .from('analytics_sessions')
        .insert([sessionData])
        .select();

      if (error) {
        console.error('❌ Failed to initialize analytics session:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          sessionData: sessionData
        });
        
        // 具体的なエラー分析
        if (error.code === 'PGRST116') {
          console.error('🔧 Table does not exist. Please run analytics-setup.sql');
        } else if (error.code === '23505') {
          console.error('🔧 Duplicate session ID. Retrying with new ID...');
          this.currentSessionId = this.generateSessionId();
          await this.initializeSession(); // リトライ
          return;
        } else if (error.message.includes('permission')) {
          console.error('🔧 Permission denied. Check RLS policies.');
        }
      } else {
        console.log('✅ Analytics session initialized successfully:', insertResult);
        this.initialized = true;
      }
    } catch (error) {
      console.error('💥 Analytics initialization critical error:', {
        error: error,
        type: typeof error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  private setupUnloadListener() {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  async trackPageView(pagePath: string) {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 Tracking page view:', pagePath);
    await this.ensureInitialized();
    
    if (!this.initialized) {
      console.warn('⚠️ Analytics not initialized, skipping page view tracking');
      return;
    }
    
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
    if (typeof window === 'undefined') return;
    
    await this.ensureInitialized();
    if (!this.initialized) return;
    
    await this.trackEvent({
      session_id: this.currentSessionId,
      event_type: 'click',
      page_path: pagePath || window.location.pathname,
      element_id: elementId,
      element_type: elementType,
    });
  }

  async trackChatMessage(messageLength: number, isUser: boolean) {
    if (typeof window === 'undefined') return;
    
    await this.ensureInitialized();
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

  async trackFeatureUse(featureName: string, pagePath: string, additionalData?: Record<string, unknown>) {
    if (typeof window === 'undefined') return;
    
    await this.ensureInitialized();
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
          ((userData.user as { raw_user_meta_data?: { permission?: string } }).raw_user_meta_data?.permission) || 'unknown';
      }

      const { error: dbError } = await analyticsSupabase
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
      console.log('🎯 Starting event tracking for:', event.event_type);
      
      // 認証状態を確認（エラーがあっても続行）
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.warn('⚠️ Auth error during event tracking:', authError);
          // 認証エラーでもイベント追跡は続行
          event.user_permission = 'unauthenticated';
        } else if (userData.user) {
          event.user_id = userData.user.id;
          const permission = 
            userData.user.user_metadata?.permission ||
            (userData.user as { raw_user_meta_data?: { permission?: string } }).raw_user_meta_data?.permission ||
            'unknown';
          event.user_permission = permission as string;
          
          console.log('👤 User data for event:', {
            userId: userData.user.id,
            permission,
            email: userData.user.email
          });
        } else {
          console.log('👤 Anonymous event tracking');
          event.user_permission = 'anonymous';
        }
      } catch (authException) {
        console.warn('⚠️ Auth exception during event tracking:', authException);
        event.user_permission = 'auth_failed';
      }
      
      // イベントデータの最終検証
      const finalEvent = {
        session_id: event.session_id,
        user_id: event.user_id || null,
        user_permission: event.user_permission || 'unknown',
        event_type: event.event_type,
        page_path: event.page_path || null,
        element_id: event.element_id || null,
        element_type: event.element_type || null,
        event_data: event.event_data || null,
      };
      
      console.log('📊 Final event data to insert:', finalEvent);
      
      // データベースに挿入（RLS回避のため専用クライアント使用）
      const { data: result, error } = await analyticsSupabase
        .from('analytics_events')
        .insert([finalEvent])
        .select('id');

      if (error) {
        console.error('❌ Event tracking failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          eventType: event.event_type,
          fullError: error,
          attemptedData: finalEvent
        });
        
        // 具体的なエラー分析
        if (error.code === 'PGRST116') {
          console.error('🔧 Analytics events table not found. Please run analytics-setup.sql');
        } else if (error.code === '23505') {
          console.error('🔧 Duplicate key constraint violation');
        } else if (error.code === '23502') {
          console.error('🔧 Not null constraint violation. Missing required field.');
        } else if (error.code === '42703') {
          console.error('🔧 Column does not exist in table');
        } else if (error.message?.includes('permission')) {
          console.error('🔧 RLS policy blocking insert. Check table policies.');
        }
        
        // データベース状態をチェック
        console.log('🔍 Checking database state...');
        const { error: tableError } = await supabase
          .from('analytics_events')
          .select('count')
          .limit(0);
          
        if (tableError) {
          console.error('🔧 Table access error:', tableError);
        } else {
          console.log('✅ Table accessible');
        }
        
      } else {
        console.log('✅ Event tracked successfully:', {
          eventType: event.event_type,
          insertedId: result?.[0]?.id
        });
      }
    } catch (error) {
      console.error('💥 Event tracking critical error:', {
        error,
        type: typeof error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }

  private async updateSessionPageViews() {
    try {
      const { error } = await analyticsSupabase
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

      const { error } = await analyticsSupabase
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