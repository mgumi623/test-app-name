/*
このSQLファイルはチーム別パスワード設定を管理するテーブルを作成します：

テーブル仕様：
- チームごとの固有パスワード管理
- パスワードの有効/無効状態管理
- チームIDによるユニーク制約

セキュリティ設定：
- 認証済みユーザーに対するCRUD操作の許可
- Row Level Security (RLS)による適切なアクセス制御
- 更新日時の自動記録
*/
CREATE TABLE password_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(team_id)
);

-- Add index for team_id
CREATE INDEX idx_password_settings_team_id ON password_settings(team_id);

-- Add RLS policies
ALTER TABLE password_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON password_settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow insert access for authenticated users
CREATE POLICY "Enable insert access for authenticated users" ON password_settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow update access for authenticated users
CREATE POLICY "Enable update access for authenticated users" ON password_settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow delete access for authenticated users
CREATE POLICY "Enable delete access for authenticated users" ON password_settings
    FOR DELETE
    TO authenticated
    USING (true);

-- Add trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_password_settings_updated_at
    BEFORE UPDATE
    ON password_settings
    FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();