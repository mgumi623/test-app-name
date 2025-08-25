-- AIチャット機能の初期化スクリプト
-- operations-runbook.mdに基づいて必要なテーブルとデータを作成

-- 1. 病院マスタの作成（サンプルデータ）
INSERT INTO hospitals (id, code, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'HOSP001', '大阪たつみリハビリテーション病院')
ON CONFLICT (code) DO NOTHING;

-- 2. 職種マスタの作成
INSERT INTO professions (id, code, name, sort_order, active) VALUES 
  ('22222222-2222-2222-2222-222222222222', 'PT', '理学療法士', 1, true),
  ('33333333-3333-3333-3333-333333333333', 'OT', '作業療法士', 2, true),
  ('44444444-4444-4444-4444-444444444444', 'ST', '言語聴覚士', 3, true)
ON CONFLICT (code) DO NOTHING;

-- 3. 部署マスタの作成
INSERT INTO departments (id, code, name, hospital_id) VALUES 
  ('55555555-5555-5555-5555-555555555555', 'REHAB', 'リハビリテーション科', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (code, hospital_id) DO NOTHING;

-- 4. 役職マスタの作成
INSERT INTO positions (id, code, name, hospital_id) VALUES 
  ('66666666-6666-6666-6666-666666666666', 'CHIEF', '主任', '11111111-1111-1111-1111-111111111111'),
  ('77777777-7777-7777-7777-777777777777', 'DEPUTY', '副主任', '11111111-1111-1111-1111-111111111111'),
  ('88888888-8888-8888-8888-888888888888', 'STAFF', '一般', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (code, hospital_id) DO NOTHING;

-- 5. チームマスタの作成
INSERT INTO teams (id, name, description, code, hospital_id) VALUES 
  ('99999999-9999-9999-9999-999999999999', '2A', '2階A病棟', '2A', '11111111-1111-1111-1111-111111111111'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2B', '2階B病棟', '2B', '11111111-1111-1111-1111-111111111111'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '3A', '3階A病棟', '3A', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (code, hospital_id) DO NOTHING;

-- 6. ロールマスタの作成
INSERT INTO roles (id, code, name, sort_order) VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'ADMIN', '管理者', 1),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'MANAGER', 'マネージャー', 2),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'STAFF', 'スタッフ', 3)
ON CONFLICT (code) DO NOTHING;

-- 7. 在籍ステータスマスタの作成
INSERT INTO staff_statuses (id, code, name, is_active_state) VALUES 
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'ACTIVE', '在籍', true),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'LEAVE', '休職', false)
ON CONFLICT (code) DO NOTHING;

-- 8. AIアプリの作成
INSERT INTO apps (id, name, description, icon, color, dify_api_id, is_active, allow_file_upload, sort_order) VALUES 
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'AIチャット', 'AIアシスタントとのチャット機能', 'chat', '#3B82F6', NULL, true, true, 1)
ON CONFLICT (name) DO NOTHING;

-- 9. 病院アプリの有効化
INSERT INTO hospital_apps (id, hospital_id, app_id, is_enabled) VALUES 
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '11111111-1111-1111-1111-111111111111', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', true)
ON CONFLICT (hospital_id, app_id) DO NOTHING;

-- 10. サンプル職員の作成
INSERT INTO staff (id, name, years, team_id, hospital_id, department_id, position_id, profession_id, status_id, active) VALUES 
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'テスト太郎', 5, '99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', true)
ON CONFLICT (id) DO NOTHING;

-- 11. ユーザー病院所属の作成（既存ユーザー用）
-- 注意: 実際のユーザーIDに置き換えてください
-- INSERT INTO user_hospital_memberships (id, user_id, hospital_id, role_id, is_primary, is_enabled, valid_from) VALUES 
--   ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', '実際のユーザーID', '11111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, true, now())
-- ON CONFLICT (user_id, hospital_id) DO NOTHING;

-- 12. プロファイルの更新（既存ユーザー用）
-- 注意: 実際のユーザーIDとstaff_idに置き換えてください
-- UPDATE profiles SET staff_id = 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj' WHERE user_id = '実際のユーザーID';

-- 完了メッセージ
SELECT 'AIチャット機能の初期化が完了しました。' as message;

