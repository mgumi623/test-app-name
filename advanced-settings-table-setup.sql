/*
このSQLファイルは詳細設定を管理するテーブルを作成します：
- 週5シフト制の設定
- 週の開始日設定
- ベテランスタッフの調整設定

セキュリティ設定：
- 認証済みユーザーに対する読み取り/更新/挿入権限の設定
- Row Level Security (RLS)による適切なアクセス制御
*/
CREATE TABLE advanced_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_five_shifts BOOLEAN DEFAULT true,
    week_starts_sunday BOOLEAN DEFAULT true,
    senior_staff_adjustment BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE advanced_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON advanced_settings
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for authenticated users" ON advanced_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Enable insert access for authenticated users" ON advanced_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);