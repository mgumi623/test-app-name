-- 管理者設定テーブルの更新
ALTER TABLE admin_settings
ADD COLUMN IF NOT EXISTS weekly_five_shifts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS weekly_sunday BOOLEAN DEFAULT true;