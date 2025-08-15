-- RIHA スケジュール管理システム用の管理者設定テーブル作成

-- 管理者設定テーブルの作成
CREATE TABLE IF NOT EXISTS admin_settings (
    id bigint PRIMARY KEY DEFAULT 1,
    password varchar(100) NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_record CHECK (id = 1)
);

-- RLS (Row Level Security) の有効化
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- 認証されたユーザーのみアクセス可能なポリシー
CREATE POLICY "Enable all operations for authenticated users" ON admin_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- 更新時のタイムスタンプを自動更新
CREATE OR REPLACE FUNCTION update_admin_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_settings_updated_at();

-- 初期パスワードの設定（'0000'）
INSERT INTO admin_settings (password) 
VALUES ('0000')
ON CONFLICT (id) DO NOTHING;