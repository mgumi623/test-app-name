/**
 * このファイルはSupabaseクライアントのグローバルインスタンスを設定します。
 * 
 * 設定内容：
 * - 自動トークンリフレッシュ
 * - セッションの永続化
 * - URLからのセッション検出
 * - パブリックスキーマの使用
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  realtime: {
    timeout: 60000
  }
});
