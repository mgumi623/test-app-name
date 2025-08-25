/**
 * このファイルはSupabaseデータベースの診断用サービスを提供します。
 * Row Level Security (RLS)を回避して、システムレベルの診断を実行します。
 * 
 * 診断項目：
 * - Supabase基本接続テスト
 * - テーブル存在確認
 * - SELECT文の実行テスト
 * - RPC機能の動作確認
 * 
 * 注意：このサービスは開発環境での診断専用です
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
export class TestService {
  private supabase = createClientComponentClient();

  async runDiagnostics(): Promise<void> {
    console.log('=== COMPREHENSIVE DIAGNOSTICS ===');
    
    try {
      // 1. 基本接続テスト
      console.log('1. Testing basic Supabase connection...');
      const { data: versionData, error: versionError } = await this.supabase
        .from('pg_stat_activity')
        .select('*')
        .limit(1);
      
      console.log('Version query result:', { data: versionData, error: versionError });
      
      // 2. テーブル存在確認（system tables経由）
      console.log('2. Checking if chat_sessions table exists...');
      const { data: tableData, error: tableError } = await this.supabase
        .rpc('check_table_exists', { table_name: 'chat_sessions' });
      
      console.log('Table check result:', { data: tableData, error: tableError });
      
      // 3. シンプルなSELECT文テスト
      console.log('3. Testing simple SELECT on chat_sessions...');
      const { data: selectData, error: selectError } = await this.supabase
        .from('chat_sessions')
        .select('*')
        .limit(0); // データを取得せず、構造のみ確認
      
      console.log('SELECT test result:', { data: selectData, error: selectError });
      
      // 4. RPC呼び出しテスト（auth.uid()）
      console.log('4. Testing RPC auth.uid()...');
      const { data: uidData, error: uidError } = await this.supabase
        .rpc('auth.uid');
      
      console.log('UID test result:', { data: uidData, error: uidError });
      
    } catch (error) {
      console.error('Diagnostics failed:', error);
    }
    
    console.log('=== END DIAGNOSTICS ===');
  }
}

export const testService = new TestService();