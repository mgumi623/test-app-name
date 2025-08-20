/*
このSQLファイルは管理者設定テーブル(admin_settings)に新しい設定列を追加します：
- weekly_five_shifts: 週5シフト制の有効/無効
- week_starts_sunday: 週の開始日を日曜日にするかどうか
- senior_staff_adjustment: ベテランスタッフの調整機能の有効/無効
*/
ALTER TABLE admin_settings
ADD COLUMN weekly_five_shifts BOOLEAN DEFAULT true,
ADD COLUMN week_starts_sunday BOOLEAN DEFAULT true,
ADD COLUMN senior_staff_adjustment BOOLEAN DEFAULT true;