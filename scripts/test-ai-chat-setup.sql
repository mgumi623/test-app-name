-- AIチャット機能のテスト用セットアップスクリプト
-- 既存のユーザーに病院所属を追加するためのスクリプト

-- 1. 既存のユーザーIDを確認
SELECT id, email FROM auth.users LIMIT 5;

-- 2. 病院マスタの確認
SELECT * FROM hospitals;

-- 3. アプリマスタの確認
SELECT * FROM apps WHERE name = 'AIチャット';

-- 4. ロールマスタの確認
SELECT * FROM roles;

-- 5. 既存のユーザー病院所属を確認
SELECT * FROM user_hospital_memberships;

-- 6. 既存のプロファイルを確認
SELECT * FROM profiles LIMIT 5;

-- 7. チャットセッションの確認
SELECT * FROM chat_sessions LIMIT 5;

-- 8. チャットメッセージの確認
SELECT * FROM chat_messages LIMIT 5;

-- 注意: 以下のコマンドは実際のユーザーIDに置き換えて実行してください
-- 
-- -- ユーザー病院所属の追加（例）
-- INSERT INTO user_hospital_memberships (
--   id, user_id, hospital_id, role_id, is_primary, is_enabled, valid_from
-- ) VALUES (
--   gen_random_uuid(),
--   '実際のユーザーID',
--   '11111111-1111-1111-1111-111111111111',
--   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
--   true,
--   true,
--   now()
-- );
-- 
-- -- プロファイルの更新（例）
-- UPDATE profiles 
-- SET staff_id = 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj' 
-- WHERE user_id = '実際のユーザーID';

