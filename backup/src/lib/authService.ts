import { supabase } from './supabase';
import { AuthError, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * ユーザーサインアップ
 * @param data サインアップデータ
 * @returns AuthResponse
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    console.log('[AuthService] サインアップ開始:', { email: data.email });
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name || '新規ユーザー'
        }
      }
    });

    if (error) {
      console.error('[AuthService] サインアップエラー:', error);
      return { user: null, error };
    }

    console.log('[AuthService] サインアップ成功:', authData.user?.id);
    return { user: authData.user, error: null };
  } catch (error) {
    console.error('[AuthService] サインアップ例外:', error);
    return { 
      user: null, 
      error: error instanceof AuthError ? error : new AuthError('サインアップ中にエラーが発生しました') 
    };
  }
}

/**
 * ユーザーログイン
 * @param data ログインデータ
 * @returns AuthResponse
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    console.log('[AuthService] ログイン開始:', { email: data.email });
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) {
      console.error('[AuthService] ログインエラー:', error);
      return { user: null, error };
    }

    console.log('[AuthService] ログイン成功:', authData.user?.id);
    return { user: authData.user, error: null };
  } catch (error) {
    console.error('[AuthService] ログイン例外:', error);
    return { 
      user: null, 
      error: error instanceof AuthError ? error : new AuthError('ログイン中にエラーが発生しました') 
    };
  }
}

/**
 * ユーザーログアウト
 * @returns Promise<void>
 */
export async function signOut(): Promise<void> {
  try {
    console.log('[AuthService] ログアウト開始');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[AuthService] ログアウトエラー:', error);
      throw error;
    }

    console.log('[AuthService] ログアウト成功');
  } catch (error) {
    console.error('[AuthService] ログアウト例外:', error);
    throw error;
  }
}

/**
 * 現在のセッションを取得
 * @returns Promise<AuthResponse>
 */
export async function getCurrentSession(): Promise<AuthResponse> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[AuthService] セッション取得エラー:', error);
      return { user: null, error };
    }

    return { user: session?.user || null, error: null };
  } catch (error) {
    console.error('[AuthService] セッション取得例外:', error);
    return { 
      user: null, 
      error: error instanceof AuthError ? error : new AuthError('セッション取得中にエラーが発生しました') 
    };
  }
}

/**
 * パスワードリセット
 * @param email メールアドレス
 * @returns Promise<{ error: AuthError | null }>
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  try {
    console.log('[AuthService] パスワードリセット開始:', { email });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      console.error('[AuthService] パスワードリセットエラー:', error);
      return { error };
    }

    console.log('[AuthService] パスワードリセットメール送信成功');
    return { error: null };
  } catch (error) {
    console.error('[AuthService] パスワードリセット例外:', error);
    return { 
      error: error instanceof AuthError ? error : new AuthError('パスワードリセット中にエラーが発生しました') 
    };
  }
}

