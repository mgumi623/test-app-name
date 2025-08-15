-- シフトルールテーブルの作成
CREATE TABLE IF NOT EXISTS shift_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id VARCHAR(10) NOT NULL,
    position VARCHAR(20) NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    minimum_staff_count INTEGER NOT NULL CHECK (minimum_staff_count >= 0),
    maximum_staff_count INTEGER CHECK (maximum_staff_count >= minimum_staff_count),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_team CHECK (team_id IN ('2A', '2B', '3A', '3B', '4A', '4B')),
    CONSTRAINT valid_position CHECK (position IN ('主任', '副主任', '一般'))
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_shift_rules_team ON shift_rules(team_id);
CREATE INDEX IF NOT EXISTS idx_shift_rules_position ON shift_rules(position);
CREATE INDEX IF NOT EXISTS idx_shift_rules_day ON shift_rules(day_of_week);

-- RLS (Row Level Security) の有効化
ALTER TABLE shift_rules ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーのみアクセス可能なポリシー
CREATE POLICY "Enable all operations for authenticated users" ON shift_rules
    FOR ALL USING (auth.role() = 'authenticated');

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shift_rules_updated_at
    BEFORE UPDATE ON shift_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();