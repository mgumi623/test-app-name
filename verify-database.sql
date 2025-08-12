-- データベース状態確認用SQL
-- Supabaseダッシュボード → SQL Editor で実行

-- 1. 作成されたテーブルを確認
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('analytics_sessions', 'analytics_events', 'analytics_errors')
ORDER BY tablename;

-- 2. テーブルの列構造を確認（analytics_events）
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'analytics_events' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. RLSポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('analytics_sessions', 'analytics_events', 'analytics_errors')
ORDER BY tablename, policyname;

-- 4. テーブルのRLS状態を確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('analytics_sessions', 'analytics_events', 'analytics_errors');

-- 5. 認証されたユーザーの権限確認
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'permission' as permission
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;