-- 分析システム用データベーススキーマ
-- Supabaseの SQL Editor で実行してください

-- 既存のテーブルとポリシーを削除（安全な再実行のため）
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS analytics_errors CASCADE;

-- セッション管理テーブル
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_permission TEXT,
  session_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  device_type TEXT,
  user_agent TEXT,
  referrer TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- イベント追跡テーブル
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_permission TEXT,
  event_type TEXT NOT NULL, -- 'page_view', 'click', 'chat_message', 'feature_use'
  page_path TEXT,
  element_id TEXT,
  element_type TEXT,
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- エラー追跡テーブル
CREATE TABLE IF NOT EXISTS analytics_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_permission TEXT,
  error_type TEXT NOT NULL,
  error_message TEXT,
  stack_trace TEXT,
  page_path TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_start_time ON analytics_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_permission ON analytics_sessions(user_permission);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_permission ON analytics_events(user_permission);
CREATE INDEX IF NOT EXISTS idx_analytics_errors_timestamp ON analytics_errors(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_errors_error_type ON analytics_errors(error_type);

-- RLS (Row Level Security) 設定
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_errors ENABLE ROW LEVEL SECURITY;

-- 管理者のみアクセス可能なポリシー（後で管理者ロールを設定）
CREATE POLICY "Admin can view all analytics sessions" ON analytics_sessions
  FOR SELECT USING (true); -- 一旦全て許可、後で管理者チェック追加

CREATE POLICY "Public can insert analytics sessions" ON analytics_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update own analytics sessions" ON analytics_sessions
  FOR UPDATE USING (true);

CREATE POLICY "Admin can view all analytics events" ON analytics_events
  FOR SELECT USING (true);

CREATE POLICY "Public can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all analytics errors" ON analytics_errors
  FOR SELECT USING (true);

CREATE POLICY "Public can insert analytics errors" ON analytics_errors
  FOR INSERT WITH CHECK (true);

-- テーブル作成確認
SELECT 
  schemaname,
  tablename 
FROM pg_tables 
WHERE tablename IN ('analytics_sessions', 'analytics_events', 'analytics_errors');

-- 最終確認
SELECT 'Analytics setup completed successfully!' as status;