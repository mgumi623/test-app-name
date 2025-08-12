-- RLSポリシーの修正（分析システム用）
-- Supabaseダッシュボード → SQL Editor で実行してください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Admin can view all analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Public can insert analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Public can update own analytics sessions" ON analytics_sessions;
DROP POLICY IF EXISTS "Admin can view all analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Public can insert analytics events" ON analytics_events;
DROP POLICY IF EXISTS "Admin can view all analytics errors" ON analytics_errors;
DROP POLICY IF EXISTS "Public can insert analytics errors" ON analytics_errors;

-- より柔軟なポリシーを作成

-- analytics_sessions テーブル
CREATE POLICY "Allow all operations on analytics_sessions" ON analytics_sessions
  USING (true)
  WITH CHECK (true);

-- analytics_events テーブル
CREATE POLICY "Allow all operations on analytics_events" ON analytics_events
  USING (true)
  WITH CHECK (true);

-- analytics_errors テーブル  
CREATE POLICY "Allow all operations on analytics_errors" ON analytics_errors
  USING (true)
  WITH CHECK (true);

-- 確認用：現在のポリシー一覧
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

-- テスト用クエリ（これが成功すればポリシーは正常）
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

SELECT 'RLS policies updated successfully!' as status;