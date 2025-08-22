# 新ERD対応 テスト手順

## 1. データベースマイグレーション実行

### 1.1 SupabaseダッシュボードでSQL実行
1. Supabaseダッシュボードにアクセス
2. SQL Editorを開く
3. `new-erd-migration.sql`の内容をコピー&ペースト
4. "Run"ボタンをクリック
5. エラーがないことを確認

### 1.2 マイグレーション結果確認
```sql
-- テーブル構造確認
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('chat_sessions', 'chat_messages', 'profiles', 'staff')
ORDER BY table_name, ordinal_position;

-- マスターテーブル確認
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
```

## 2. テストデータ作成

### 2.1 テストユーザー作成
```sql
-- テストユーザーをstaffテーブルに挿入
INSERT INTO staff (
    hospital_id,
    department_id,
    position_id,
    profession_id,
    team_id,
    status_id,
    name,
    years
) VALUES (
    (SELECT id FROM hospitals WHERE name = '伊丹せいふう病院' LIMIT 1),
    (SELECT id FROM departments WHERE name = 'リハビリテーション科' LIMIT 1),
    (SELECT id FROM positions WHERE name = '主任' LIMIT 1),
    (SELECT id FROM professions WHERE name = 'PT' LIMIT 1),
    (SELECT id FROM teams WHERE name = '2A' LIMIT 1),
    (SELECT id FROM staff_statuses WHERE name = '在職' LIMIT 1),
    'テストユーザー',
    5
) RETURNING id;
```

### 2.2 プロファイルとスタッフの関連付け
```sql
-- 既存のプロファイルをスタッフと関連付け
UPDATE profiles 
SET staff_id = (SELECT id FROM staff WHERE name = 'テストユーザー' LIMIT 1)
WHERE user_id = 'YOUR_USER_ID'; -- 実際のユーザーIDに置き換え
```

### 2.3 テストチャットセッション作成
```sql
-- テストチャットセッション作成
INSERT INTO chat_sessions (
    user_id,
    title,
    hospital_id
) VALUES (
    'YOUR_USER_ID', -- 実際のユーザーIDに置き換え
    'テストチャット',
    (SELECT id FROM hospitals WHERE name = '伊丹せいふう病院' LIMIT 1)
) RETURNING id;
```

### 2.4 テストメッセージ作成
```sql
-- テストメッセージ作成
INSERT INTO chat_messages (
    session_id,
    content,
    sender_kind,
    sender_user_id
) VALUES (
    'SESSION_ID', -- 上記で作成したセッションIDに置き換え
    'こんにちは！テストメッセージです。',
    'user',
    'YOUR_USER_ID' -- 実際のユーザーIDに置き換え
);

INSERT INTO chat_messages (
    session_id,
    content,
    sender_kind,
    sender_user_id
) VALUES (
    'SESSION_ID', -- 上記で作成したセッションIDに置き換え
    'こんにちは！AIアシスタントです。テストメッセージを受け取りました。',
    'ai',
    NULL
);
```

## 3. アプリケーション動作確認

### 3.1 開発サーバー起動
```bash
npm run dev
```

### 3.2 ログイン確認
1. ブラウザで `http://localhost:3000/login` にアクセス
2. テストユーザーでログイン
3. プロファイル情報が正しく表示されることを確認
   - 名前、部署、職位、病院が表示される
   - null値の場合は適切に処理される

### 3.3 チャット機能確認
1. AIチャットページにアクセス
2. チャットセッション一覧が表示されることを確認
3. 新しいチャットを作成
4. メッセージを送信
5. AIからの応答が正常に表示されることを確認

### 3.4 エラーログ確認
1. ブラウザの開発者ツールを開く
2. Consoleタブでエラーがないことを確認
3. NetworkタブでAPIリクエストが正常に完了することを確認

## 4. 問題発生時の対処

### 4.1 外部キー名の確認
```sql
-- SupabaseのRelationshipsで確認が必要な場合
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('staff', 'chat_sessions', 'chat_messages');
```

### 4.2 RLSポリシーの確認
```sql
-- RLSポリシー確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'staff', 'chat_sessions', 'chat_messages')
ORDER BY tablename, policyname;
```

### 4.3 データ整合性確認
```sql
-- プロファイルとスタッフの関連確認
SELECT 
    p.user_id,
    p.name as profile_name,
    s.name as staff_name,
    h.name as hospital_name,
    d.name as department_name,
    pos.name as position_name
FROM profiles p
LEFT JOIN staff s ON p.staff_id = s.id
LEFT JOIN hospitals h ON s.hospital_id = h.id
LEFT JOIN departments d ON s.department_id = d.id
LEFT JOIN positions pos ON s.position_id = pos.id
WHERE p.user_id = 'YOUR_USER_ID'; -- 実際のユーザーIDに置き換え
```

## 5. 成功判定基準

- [ ] ログイン後、プロファイル情報が正しく表示される
- [ ] 部署、職位、病院が正しく表示される（null値も適切に処理）
- [ ] チャットセッションが正常に作成される
- [ ] メッセージの送受信が正常に動作する
- [ ] ブラウザコンソールにエラーが表示されない
- [ ] ネットワークタブでAPIリクエストが正常に完了する

## 6. 不明点リスト

1. **外部キー名の確認**: SupabaseのRelationshipsで実際のFK名を確認
2. **既存データの移行**: 既存のprofiles.hospital_idデータの移行方法
3. **RLSポリシーの詳細**: より細かい権限制御が必要な場合の調整
4. **パフォーマンス**: 大量データでのクエリパフォーマンス確認

