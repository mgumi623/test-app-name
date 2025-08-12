-- 分析テーブルの完全な再作成
-- Supabaseダッシュボード → SQL Editor で実行してください

-- 既存のテーブルを完全に削除（CASCADE で関連ポリシーも削除）
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS analytics_sessions CASCADE;
DROP TABLE IF EXISTS analytics_errors CASCADE;

-- セッション管理テーブル
CREATE TABLE analytics_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_permission TEXT,
  session_id TEXT NOT NULL UNIQUE,
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
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_permission TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'click', 'chat_message', 'feature_use', 'error')),
  page_path TEXT,
  element_id TEXT,
  element_type TEXT,
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- エラー追跡テーブル
CREATE TABLE analytics_errors (
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
CREATE INDEX idx_analytics_sessions_user_id ON analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_start_time ON analytics_sessions(start_time DESC);
CREATE INDEX idx_analytics_sessions_permission ON analytics_sessions(user_permission);
CREATE INDEX idx_analytics_sessions_session_id ON analytics_sessions(session_id);

CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_page_path ON analytics_events(page_path);
CREATE INDEX idx_analytics_events_permission ON analytics_events(user_permission);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);

CREATE INDEX idx_analytics_errors_timestamp ON analytics_errors(timestamp DESC);
CREATE INDEX idx_analytics_errors_error_type ON analytics_errors(error_type);
CREATE INDEX idx_analytics_errors_session_id ON analytics_errors(session_id);

-- RLSを無効化（開発用）
ALTER TABLE analytics_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_errors DISABLE ROW LEVEL SECURITY;

-- テスト用データ挿入
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
);

-- 作成されたテーブル構造を確認
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('analytics_sessions', 'analytics_events', 'analytics_errors') 
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

SELECT 'Analytics tables recreated successfully!' as status;