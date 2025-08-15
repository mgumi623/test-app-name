-- RIHA スケジュール管理システム用のスタッフテーブル作成

-- スタッフテーブルの作成
CREATE TABLE IF NOT EXISTS staff (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  team VARCHAR(10) NOT NULL CHECK (team IN ('2A', '2B', '3A', '3B', '4A', '4B')),
  position VARCHAR(20) NOT NULL CHECK (position IN ('主任', '副主任', '一般')),
  profession VARCHAR(10) NOT NULL CHECK (profession IN ('PT', 'OT', 'ST', 'DH')),
  years INTEGER NOT NULL CHECK (years >= 0 AND years <= 50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_staff_team ON staff(team);
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position);
CREATE INDEX IF NOT EXISTS idx_staff_profession ON staff(profession);
CREATE INDEX IF NOT EXISTS idx_staff_years ON staff(years);

-- RLS (Row Level Security) の有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーのみアクセス可能なポリシー
CREATE POLICY "Enable all operations for authenticated users" ON staff
    FOR ALL USING (auth.role() = 'authenticated');

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at トリガーの作成
CREATE TRIGGER update_staff_updated_at 
    BEFORE UPDATE ON staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- テーブル構造の確認用ビュー
CREATE OR REPLACE VIEW staff_summary AS
SELECT 
    team,
    position,
    profession,
    COUNT(*) as count,
    ROUND(AVG(years), 1) as avg_years
FROM staff 
GROUP BY team, position, profession
ORDER BY team, position, profession;

-- デバッグ用: テーブルの統計情報取得用関数
CREATE OR REPLACE FUNCTION get_staff_stats()
RETURNS TABLE(
    total_staff BIGINT,
    teams_count BIGINT,
    positions JSON,
    professions JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM staff) as total_staff,
        (SELECT COUNT(DISTINCT team) FROM staff) as teams_count,
        (SELECT json_object_agg(position, count) 
         FROM (SELECT position, COUNT(*) as count FROM staff GROUP BY position) p) as positions,
        (SELECT json_object_agg(profession, count) 
         FROM (SELECT profession, COUNT(*) as count FROM staff GROUP BY profession) pr) as professions;
END;
$$ LANGUAGE plpgsql;