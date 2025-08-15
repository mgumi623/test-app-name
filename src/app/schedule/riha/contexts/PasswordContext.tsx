'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PasswordContextType {
  updatePassword: (newPassword: string) => Promise<void>;
  verifyPassword: (password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const PasswordContext = createContext<PasswordContextType | undefined>(undefined);

export function PasswordProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  // パスワードを初期化（必要な場合）
  useEffect(() => {
    const initializePassword = async () => {
      try {
        const { data } = await supabase
          .from('admin_settings')
          .select('password')
          .eq('id', 1)
          .single();

        if (!data) {
          // 初期パスワードを設定
          await supabase
            .from('admin_settings')
            .insert([{ id: 1, password: '0000' }]);
        }
      } catch (error) {
        console.error('Failed to initialize password:', error);
        await supabase
          .from('admin_settings')
          .upsert([{ id: 1, password: '0000' }]);
      }
    };

    initializePassword();
  }, [supabase]);

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        throw new Error('パスワードの更新に失敗しました');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'パスワードの更新に失敗しました');
      }
    } catch (error) {
      console.error('Password update failed:', error);
      setError('パスワードの更新に失敗しました');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPassword = async (password: string) => {
    try {
      const response = await fetch('/api/admin-settings');
      if (!response.ok) {
        throw new Error('パスワードの検証に失敗しました');
      }

      const data = await response.json();
      if (!data || !data.password) {
        // データが存在しない場合は初期パスワードとして扱う
        await updatePassword('0000');
        return password === '0000';
      }

      return data.password === password;
    } catch (error) {
      console.error('Password verification error:', error);
      setError('パスワードの検証に失敗しました');
      return false;
    }
  };

  return (
    <PasswordContext.Provider value={{ updatePassword, verifyPassword, loading, error }}>
      {children}
    </PasswordContext.Provider>
  );
}

export function usePassword() {
  const context = useContext(PasswordContext);
  if (context === undefined) {
    throw new Error('usePassword must be used within a PasswordProvider');
  }
  return context;
}