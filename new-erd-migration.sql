-- 新ERD対応 データベースマイグレーション
-- 実行順序: 1. マスターテーブル作成 → 2. 既存テーブル修正 → 3. データ移行 → 4. 制約追加

-- ========================================
-- 1. マスターテーブル作成
-- ========================================

-- 病院マスター
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 部署マスター
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 職位マスター
CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 職種マスター
CREATE TABLE IF NOT EXISTS professions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- チームマスター
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(10) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- スタッフステータスマスター
CREATE TABLE IF NOT EXISTS staff_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- 2. スタッフテーブル作成
-- ========================================

CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position_id UUID REFERENCES positions(id) ON DELETE SET NULL,
    profession_id UUID REFERENCES professions(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    status_id UUID REFERENCES staff_statuses(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    years INTEGER CHECK (years >= 0 AND years <= 50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================
-- 3. 既存テーブル修正
-- ========================================

-- profilesテーブルにstaff_idカラムを追加
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id) ON DELETE SET NULL;

-- chat_sessionsテーブルにhospital_idカラムを追加
ALTER TABLE chat_sessions 
ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL;

-- chat_messagesテーブルを新ERD対応に修正
-- 既存のsenderカラムを削除し、新しいカラムを追加
ALTER TABLE chat_messages 
DROP COLUMN IF EXISTS sender;

ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS sender_kind VARCHAR(10) CHECK (sender_kind IN ('user', 'ai', 'system')) NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ========================================
-- 4. インデックス作成
-- ========================================

-- マスターテーブル
CREATE INDEX IF NOT EXISTS idx_hospitals_name ON hospitals(name);
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_positions_name ON positions(name);
CREATE INDEX IF NOT EXISTS idx_professions_name ON professions(name);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
CREATE INDEX IF NOT EXISTS idx_staff_statuses_name ON staff_statuses(name);

-- スタッフテーブル
CREATE INDEX IF NOT EXISTS idx_staff_hospital_id ON staff(hospital_id);
CREATE INDEX IF NOT EXISTS idx_staff_department_id ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_position_id ON staff(position_id);
CREATE INDEX IF NOT EXISTS idx_staff_profession_id ON staff(profession_id);
CREATE INDEX IF NOT EXISTS idx_staff_team_id ON staff(team_id);
CREATE INDEX IF NOT EXISTS idx_staff_status_id ON staff(status_id);

-- プロファイル・チャットテーブル
CREATE INDEX IF NOT EXISTS idx_profiles_staff_id ON profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_hospital_id ON chat_sessions(hospital_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_kind ON chat_messages(sender_kind);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_user_id ON chat_messages(sender_user_id);

-- ========================================
-- 5. RLSポリシー設定
-- ========================================

-- マスターテーブル
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- 認証ユーザーに読み取り権限を付与
CREATE POLICY "Enable read access for authenticated users" ON hospitals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON departments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON positions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON professions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON teams FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON staff_statuses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for authenticated users" ON staff FOR SELECT USING (auth.role() = 'authenticated');

-- ========================================
-- 6. サンプルデータ挿入
-- ========================================

-- 病院データ
INSERT INTO hospitals (name, address, phone, email) VALUES
    ('伊丹せいふう病院', '兵庫県伊丹市', '072-000-0000', 'info@seifu.com'),
    ('大阪たつみ病院', '大阪府大阪市', '06-000-0000', 'info@tatsumi.com'),
    ('奈良町りは病院', '奈良県奈良市', '0742-000-0000', 'info@nara-riha.com'),
    ('宇治脳卒中リハビリテーション病院', '京都府宇治市', '0774-000-0000', 'info@uji-stroke.com'),
    ('岸和田リハビリテーション病院', '大阪府岸和田市', '072-000-0000', 'info@kishiwada-riha.com'),
    ('川西リハビリテーション病院', '兵庫県川西市', '072-000-0000', 'info@kawanishi-riha.com'),
    ('彩都リハビリテーション病院', '大阪府茨木市', '072-000-0000', 'info@saito-riha.com'),
    ('登美ヶ丘リハビリテーション病院', '奈良県奈良市', '0742-000-0000', 'info@tomigaoka-riha.com'),
    ('阪神リハビリテーション病院', '兵庫県西宮市', '0798-000-0000', 'info@hanshin-riha.com')
ON CONFLICT (name) DO NOTHING;

-- 部署データ
INSERT INTO departments (name) VALUES
    ('リハビリテーション科'),
    ('理学療法科'),
    ('作業療法科'),
    ('言語聴覚科'),
    ('看護部'),
    ('事務部')
ON CONFLICT (name) DO NOTHING;

-- 職位データ
INSERT INTO positions (name) VALUES
    ('主任'),
    ('副主任'),
    ('一般'),
    ('部長'),
    ('課長'),
    ('係長')
ON CONFLICT (name) DO NOTHING;

-- 職種データ
INSERT INTO professions (name) VALUES
    ('PT'),
    ('OT'),
    ('ST'),
    ('DH'),
    ('看護師'),
    ('事務員')
ON CONFLICT (name) DO NOTHING;

-- チームデータ
INSERT INTO teams (name) VALUES
    ('2A'),
    ('2B'),
    ('3A'),
    ('3B'),
    ('4A'),
    ('4B')
ON CONFLICT (name) DO NOTHING;

-- スタッフステータスデータ
INSERT INTO staff_statuses (name) VALUES
    ('在職'),
    ('退職'),
    ('休職'),
    ('研修中')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- 7. データ移行（既存データがある場合）
-- ========================================

-- 既存のprofiles.hospital_idがある場合、staffテーブルに移行
-- 注意: この部分は既存データの状況に応じて調整が必要

-- ========================================
-- 8. 制約追加
-- ========================================

-- profiles.staff_idのUNIQUE制約（1:1関係の保証）
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_staff_id_unique UNIQUE (staff_id);

-- ========================================
-- 9. 確認クエリ
-- ========================================

-- テーブル構造確認
SELECT '=== テーブル構造確認 ===' as info;

SELECT 'chat_sessions' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_sessions'
ORDER BY ordinal_position;

SELECT 'chat_messages' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'chat_messages'
ORDER BY ordinal_position;

SELECT 'profiles' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

SELECT 'staff' as table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'staff'
ORDER BY ordinal_position;

-- マスターテーブル確認
SELECT '=== マスターテーブル確認 ===' as info;
SELECT 'hospitals' as table, count(*) as count FROM hospitals
UNION ALL
SELECT 'departments' as table, count(*) as count FROM departments
UNION ALL
SELECT 'positions' as table, count(*) as count FROM positions
UNION ALL
SELECT 'professions' as table, count(*) as count FROM professions
UNION ALL
SELECT 'teams' as table, count(*) as count FROM teams
UNION ALL
SELECT 'staff_statuses' as table, count(*) as count FROM staff_statuses;

SELECT '新ERD対応マイグレーションが完了しました！' as status;

