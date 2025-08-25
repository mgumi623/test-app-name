'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Profile {
  id: string;
  role: string;
  department: string | null;
  name?: string;
  hospital?: string;
  position?: string;
  profession?: string;
}

interface User {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: any; }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any; }>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // プロフィール情報を取得（DB調整中はスキップ）
        if (session?.user) {
          // DB調整中はプロフィール取得をスキップし、デフォルトプロフィールを使用
          console.warn('DB adjustment in progress. Using default profile.');
          setProfile({
            id: session.user.id,
            role: 'staff',
            department: null
          });
        }
        
        setIsLoading(false);

        // DB調整中は自動リダイレクトを無効化
        // if (session?.user) {
        //   router.push('/Select');
        // }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        
        // プロフィール情報を取得（DB調整中はスキップ）
        if (session?.user) {
          // DB調整中はプロフィール取得をスキップし、デフォルトプロフィールを使用
          console.warn('DB adjustment in progress. Using default profile.');
          setProfile({
            id: session.user.id,
            role: 'staff',
            department: null
          });
        }
        
        // DB調整中は自動リダイレクトを無効化
        // router.push('/Select');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        router.push('/login');
      }
    });

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const clearAuthError = () => setError(null);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      return { user: data.user, error };
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { user: data.user, error };
    } catch (err) {
      return { user: null, error: err };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    clearAuthError
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