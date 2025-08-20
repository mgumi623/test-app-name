/*
このSQLファイルはSupabaseのユーザー権限を管理するためのツールです：

機能：
1. 現在のユーザー情報と権限の確認
2. 個別ユーザーの権限設定
3. 複数ユーザーの一括権限設定
4. 権限設定後の確認

使用方法：
- メールアドレスを実際のユーザーのものに置き換えて実行
- Supabaseダッシュボード → SQL Editor で実行
*/

-- 1. 現在のユーザー情報を確認
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'permission' as permission,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. 特定ユーザーの権限を設定（メールアドレスを置き換えてください）
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{permission}',
  '"研究員"'
)
WHERE email = 'your-email@example.com';

-- 3. 複数ユーザーの権限を一括設定する例
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'),
  '{permission}',
  '"管理職"'
)
WHERE email IN ('admin1@example.com', 'admin2@example.com');

-- 4. 権限設定後の確認
SELECT 
  email,
  raw_user_meta_data->>'permission' as permission
FROM auth.users
WHERE raw_user_meta_data->>'permission' IS NOT NULL;