-- 分析システムテーブルのRLSを完全に無効化（オプション）
-- 注意：これは全てのユーザーがテーブルにアクセスできるようになります
-- Supabaseダッシュボード → SQL Editor で実行してください

-- RLSを無効化
ALTER TABLE analytics_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;  
ALTER TABLE analytics_errors DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（RLS無効化後は不要）
DROP POLICY IF EXISTS "Admin can view all analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Public can insert analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Public can update own analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Admin can view all analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Public can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admin can view all analytics errors" ON analytics_errors;
DROP POLICY IF EXISTS "Public can insert analytics errors" ON analytics_errors;
DROP POLICY IF EXISTS "Allow all operations on analytics_sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Allow all operations on analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Allow all operations on analytics_errors" ON analytics_errors;

-- テスト用クエリ
INSERT INTO analytics_events (
  session_id,
  user_permission,
  event_type,
  page_path
) VALUES (
  'test_session_' || extract(epoch from now()),
  'test_user',
  'page_view',
  '/test'
) RETURNING id;

-- RLS状態の確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('analytics_sessions', 'analytics_events', 'analytics_errors');

SELECT 'RLS disabled for analytics tables!' as status;