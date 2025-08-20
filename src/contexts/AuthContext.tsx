'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthContextType, UserProfile } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const debugLog = (message: string, data?: any) => {
  // デバッグログを常に有効にして問題を特定
  console.log(`[Auth] ${message}`, data || '');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // プロファイル情報を取得（リトライ機能付き）
  async function fetchProfile(userId: string, retryCount = 0) {
    try {
      debugLog(`Fetching profile for user (attempt ${retryCount + 1})`, userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // 初回エラーの場合は少し待ってからリトライ（最大2回）
        if (retryCount < 2) {
          debugLog(`Retrying profile fetch in 1 second...`);
          setTimeout(() => {
            fetchProfile(userId, retryCount + 1);
          }, 1000);
          return;
        }
        
        // プロファイル取得エラーでもユーザーは有効なので、プロファイルをnullに設定
        setProfile(null);
        setIsLoading(false); // 重要: ローディング状態を終了
        return;
      }

      if (data) {
        debugLog('Profile fetched successfully', data);
        setProfile(data);
      } else {
        debugLog('No profile found for user');
        setProfile(null);
      }
      
      // 成功時も必ずローディング状態を終了
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      
      // 初回エラーの場合は少し待ってからリトライ（最大2回）
      if (retryCount < 2) {
        debugLog(`Retrying profile fetch in 1 second...`);
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, 1000);
        return;
      }
      
      // エラーが発生した場合もプロファイルをnullに設定
      setProfile(null);
      setIsLoading(false); // 重要: ローディング状態を終了
    }
  }

  // 初期化時とセッション変更時のユーザー状態の設定
  const handleSession = async (session: any) => {
    try {
      if (session?.user) {
        debugLog('Setting user from session', session.user);
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        debugLog('No session found, clearing user and profile');
        setUser(null);
        setProfile(null);
        setIsLoading(false); // セッションがない場合は即座にローディング終了
      }
    } catch (error) {
      console.error('Error in handleSession:', error);
      setIsLoading(false); // エラー時もローディング終了
    }
  };

  useEffect(() => {
    debugLog('Initializing auth context');
    
    // 初期セッション取得
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // リフレッシュトークンエラーの場合は認証状態をクリア
          if (error.message.includes('Refresh Token') || error.message.includes('Invalid')) {
            debugLog('Refresh token error, clearing auth state');
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setError(null);
          } else {
            setError(error.message);
          }
          setIsLoading(false);
          return;
        }
        
        debugLog('Initial session check', session);
        await handleSession(session);
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // 認証状態の変更を監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog('Auth state changed', { event, session });
      
      try {
        // サインイン成功時の特別な処理
        if (event === 'SIGNED_IN') {
          debugLog('Sign in event detected, handling session');
          await handleSession(session);
          
          // 現在のパスがログインページの場合、Next.jsのルーターを使用してリダイレクト
          if (typeof window !== 'undefined' && window.location.pathname === '/login') {
            debugLog('Redirecting from login to Select page');
            setTimeout(() => {
              router.push('/Select');
            }, 500);
          }
        } else if (event === 'SIGNED_OUT') {
          debugLog('Sign out event detected, clearing state');
          setUser(null);
          setProfile(null);
          setError(null);
          
          // ログインページ以外にいる場合はログインページにリダイレクト
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          debugLog('Token refreshed, updating session');
          await handleSession(session);
        } else {
          await handleSession(session);
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setIsLoading(false);
      }
    });

    return () => {
      debugLog('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // プロファイル更新用の関数
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      debugLog('Updating profile', updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // プロファイルを再取得
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // ログアウト処理
  const signOut = async () => {
    try {
      debugLog('Starting sign out process');
      
      // 状態を即座にクリア
      setUser(null);
      setProfile(null);
      setError(null);
      
      // Supabaseからサインアウト
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signOut:', error);
        // エラーがあっても続行
      }
      
      debugLog('Sign out completed, redirecting to login');
      
      // Next.jsのルーターを使用してリダイレクト
      router.push('/login');
    } catch (error) {
      console.error('Error in signOut:', error);
      // エラーが発生してもリダイレクトを実行
      router.push('/login');
    }
  };

  // 認証エラー時のクリア処理
  const clearAuthError = () => {
    setError(null);
  };

  const value = {
    user,
    profile,
    isLoading,
    error,
    signOut,
    updateProfile,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}