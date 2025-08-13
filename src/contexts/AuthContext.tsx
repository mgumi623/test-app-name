'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/auth-helpers-nextjs';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
  permission?: string;
  job?: string;
  raw_user_meta_data?: Record<string, unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // Supabase client is imported at the top

  useEffect(() => {
    // 初期認証状態の確認
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          // セッションエラーの場合、ローカルストレージをクリア
          if (error.message.includes('refresh') || error.message.includes('token')) {
            await supabase.auth.signOut();
          }
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setUserData({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            role: session.user.user_metadata?.role,
            permission: session.user.user_metadata?.permission,
            job: session.user.user_metadata?.job,
            raw_user_meta_data: session.user.user_metadata,
          });
        }
      } catch (error) {
        console.error('Failed to get initial session:', error);
        await supabase.auth.signOut();
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          setUserData({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            role: session.user.user_metadata?.role,
            permission: session.user.user_metadata?.permission,
            job: session.user.user_metadata?.job,
            raw_user_meta_data: session.user.user_metadata,
          });
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        // ログイン成功時にユーザーデータを設定
        setUser(data.user);
        setUserData({
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name,
          role: data.user.user_metadata?.role,
          permission: data.user.user_metadata?.permission,
          job: data.user.user_metadata?.job,
          raw_user_meta_data: data.user.user_metadata,
        });
        
        router.push('/Select');
      }

      return { error: null };
    } catch (error) {
      return { error: 'ログインに失敗しました' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserData(null);
      
      // ローカルストレージも完全にクリア
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      // エラーが発生してもログアウト状態にする
      setUser(null);
      setUserData(null);
      router.push('/login');
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};