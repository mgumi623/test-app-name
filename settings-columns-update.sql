/*
このSQLファイルはチームテーブルに設定用の列を追加します：

追加される設定：
- weekly_five_shifts: 週5シフト制の有効/無効
- week_starts_sunday: 週の開始日を日曜にするかどうか
- senior_staff_adjustment: ベテランスタッフの調整機能

その他の更新：
- 更新日時を自動記録するトリガーの更新
*/
ALTER TABLE teams
ADD COLUMN weekly_five_shifts BOOLEAN DEFAULT true,
ADD COLUMN week_starts_sunday BOOLEAN DEFAULT true,
ADD COLUMN senior_staff_adjustment BOOLEAN DEFAULT true;

-- Update the trigger to include new columns
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';