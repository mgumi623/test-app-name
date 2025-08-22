'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthContextType, UserProfile } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const debugLog = (message: string, data?: unknown) => {
  console.log(`[Auth] ${message}`, data ?? '');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[AuthContext] State changed:', {
      user: user ? 'exists' : 'null',
      profile: profile ? 'exists' : 'null',
      isLoading,
      error,
    });
  }, [user, profile, isLoading, error]);

  // -----------------------------
  // プロファイル取得（新ERD対応・最適化）
  // -----------------------------
  async function fetchProfile(userId: string, retryCount = 0) {
    // 既に取得済みならスキップ
    if (profile && profile.user_id === userId) {
      debugLog('Profile already loaded for this user, skip fetching');
      setIsLoading(false);
      return;
    }

    // 8秒タイムアウト
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      debugLog(`Fetching profile for user (attempt ${retryCount + 1})`, userId);

      // 最もシンプルなクエリから開始
      debugLog('Starting with basic query');
      debugLog('Query parameters:', { userId, retryCount });
      
      // まず、profilesテーブルの存在確認
      const { data: tableCheck, error: tableError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);
        
      debugLog('Table check result:', {
        data: tableCheck ? 'table exists' : 'no data',
        error: tableError ? {
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint,
          code: tableError.code
        } : 'no error'
      });

      let data, error;
      try {
        // 最も基本的なクエリから開始
        const result = await supabase
          .from('profiles')
          .select('user_id, name, created_at, updated_at, staff_id')
          .eq('user_id', userId)
          .abortSignal(controller.signal)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
        
        debugLog('Supabase query executed successfully', {
          hasData: !!data,
          hasError: !!error,
          dataKeys: data ? Object.keys(data) : null
        });
      } catch (queryError) {
        console.error('Supabase query execution failed:', {
          error: queryError,
          message: queryError instanceof Error ? queryError.message : 'Unknown query error',
          stack: queryError instanceof Error ? queryError.stack : undefined
        });
        error = queryError;
      }
 
      clearTimeout(timer);
      debugLog('Supabase query completed', { 
        data: data ? 'exists' : 'null', 
        error: error ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
          hint: null,
          code: null,
          fullError: JSON.stringify(error, null, 2)
        } : 'no error',
        errorObject: error
      });


      if (error) {
        console.error('Error fetching profile:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
          hint: null,
          code: null,
          fullError: error
        });
        if (retryCount < 1) {
          debugLog('Retrying profile fetch in 1 second...');
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000);
          return;
        }
        setProfile(null);
        setIsLoading(false);
        return;
      }

      if (!data) {
        debugLog('No profile row found');
        setProfile(null);
        setIsLoading(false);
        return;
      }

              // 基本的なプロファイル情報のみマッピング
        const mapped: UserProfile = {
          id: data.user_id, // user_idをidとして使用
          user_id: data.user_id,
          name: data.name,
          role: null,
          created_at: data.created_at,
          updated_at: data.updated_at,
          staff_id: data.staff_id,
          // 基本的なクエリでは部署/職位/病院情報は取得しない
          department: null,
          position: null,
          hospital: null,
        };

      debugLog('Profile mapped successfully', mapped);
      setProfile(mapped);
      setIsLoading(false);
    } catch (e) {
      clearTimeout(timer);
      console.error('Error in fetchProfile:', {
        error: e,
        message: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined
      });
      if (retryCount < 1) {
        debugLog('Retrying profile fetch in 1 second (catch)...');
        setTimeout(() => fetchProfile(userId, retryCount + 1), 1000);
        return;
      }
      setProfile(null);
      setIsLoading(false);
    }
  }

  // -----------------------------
  // セッション処理
  // -----------------------------
  interface Session {
    user: User;
  }

  const handleSession = async (session: Session | null) => {
    try {
      debugLog('handleSession called', session ? 'exists' : 'null');
      if (session?.user) {
        setUser(session.user);

        if (profile && profile.user_id === session.user.id) {
          debugLog('Profile already exists for this user, skip fetch');
          setIsLoading(false);
          return;
        }

        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Error in handleSession:', e);
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  // -----------------------------
  // 初期化＆Auth監視
  // -----------------------------
  useEffect(() => {
    debugLog('Initializing auth context');

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (error.message.includes('Refresh Token') || error.message.includes('Invalid')) {
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

        await handleSession(session);
      } catch (e) {
        console.error('Error in initializeAuth:', e);
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      debugLog('Auth state changed', { event, session: !!session });
      try {
        if (event === 'SIGNED_IN') {
          await handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setError(null);
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            router.push('/login');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          if (profile && session?.user && profile.user_id === session.user.id) {
            setIsLoading(false);
          } else {
            await handleSession(session);
          }
        } else {
          await handleSession(session);
        }
      } catch (e) {
        console.error('Error in auth state change handler:', e);
        setIsLoading(false);
      }
    });

    return () => {
      debugLog('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // -----------------------------
  // プロファイル更新
  // -----------------------------
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      debugLog('Updating profile', updates);

      // profiles のみ更新（部署/職位/病院は staff 側で別更新が必要）
      const { error } = await supabase
        .from('profiles')
        .update({
          name: updates.name,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchProfile(user.id);
    } catch (e) {
      console.error('Error updating profile:', e);
      throw e;
    }
  };

  // -----------------------------
  // サインアウト
  // -----------------------------
  const signOut = async () => {
    try {
      setUser(null);
      setProfile(null);
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error during signOut:', error);
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const clearAuthError = () => setError(null);

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    error,
    signOut,
    updateProfile,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
