# AIチャット機能 - Supabase連携修正

## 概要

operations-runbook.mdに基づいて、AIチャット機能のSupabaseとの連携を修正しました。主な変更点は病院スコープ対応とユーザーの主所属病院管理です。

## 主な修正内容

### 1. 病院スコープ対応

- **ChatService**: ユーザーの主所属病院を取得し、病院スコープでチャットセッションを管理
- **AuthContext**: ユーザープロファイルに主所属病院ID（`primary_hospital_id`）を追加
- **useChatSessions**: 病院スコープでのセッション管理

### 2. データベース連携の改善

#### 追加された関数

- `getUserPrimaryHospital()`: ユーザーの主所属病院IDを取得
- `getAIAppId()`: AIアプリのIDを取得（存在しない場合は自動作成）

#### 修正されたクエリ

- チャットセッション取得時に病院IDでフィルタリング
- セッション作成時に適切な病院IDとアプリIDを設定

### 3. 型定義の更新

#### UserProfile型の拡張

```typescript
export interface UserProfile {
  // ... 既存フィールド
  primary_hospital_id: string | null; // 主所属病院ID
}
```

### 4. エラーハンドリングの強化

- 主所属病院が見つからない場合の適切なエラーハンドリング
- 病院スコープでのアクセス制御
- エラー表示とリトライ機能の追加

## データベース要件

### 必要なテーブル

1. **hospitals** - 病院マスタ
2. **user_hospital_memberships** - ユーザーの病院所属
3. **apps** - アプリマスタ
4. **hospital_apps** - 病院アプリ有効化
5. **chat_sessions** - チャットセッション
6. **chat_session_members** - セッション参加者
7. **chat_messages** - メッセージ

### 初期化スクリプト

`scripts/init-ai-chat-tables.sql` を実行して必要なデータを作成してください。

## 使用方法

### 1. データベース初期化

```sql
-- Supabase SQL Editorで実行
\i scripts/init-ai-chat-tables.sql
```

### 2. ユーザー病院所属の設定

```sql
-- 既存ユーザーに病院所属を追加
INSERT INTO user_hospital_memberships (
  id, user_id, hospital_id, role_id, is_primary, is_enabled, valid_from
) VALUES (
  gen_random_uuid(),
  'ユーザーID',
  '11111111-1111-1111-1111-111111111111',
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  true,
  true,
  now()
);
```

### 3. プロファイルの更新

```sql
-- ユーザープロファイルにstaff_idを設定
UPDATE profiles 
SET staff_id = 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj' 
WHERE user_id = 'ユーザーID';
```

## 動作確認

### デバッグ情報

開発環境では、ローディング画面に以下の情報が表示されます：

- User ID
- Primary Hospital ID
- Hospital Name
- Loading Status
- Error Status
- Current Session ID
- Sessions Count

### ログ出力

以下のログで動作を確認できます：

```javascript
[ChatService] Getting primary hospital for user: [ユーザーID]
[ChatService] Primary hospital found: [病院ID]
[useChatSessions] Loading sessions for user: [ユーザーID] hospital: [病院ID]
```

## セキュリティ

### RLS（Row Level Security）

operations-runbook.mdに基づいて、以下のRLSポリシーが推奨されます：

1. **病院スコープ**: ユーザーは所属病院のデータのみアクセス可能
2. **チャットセッション**: 参加者または作成者のみアクセス可能
3. **メッセージ**: セッション参加者のみアクセス可能

### アクセス制御

- 主所属病院が設定されていないユーザーはチャット機能にアクセス不可
- 病院スコープ外のデータは自動的にフィルタリング

## トラブルシューティング

### よくある問題

1. **主所属病院が見つからない**
   - `user_hospital_memberships`テーブルにレコードが存在するか確認
   - `is_primary = true` かつ `is_enabled = true` のレコードが必要
   - デフォルトの病院ID（`11111111-1111-1111-1111-111111111111`）が使用されます

2. **AIアプリが見つからない**
   - `apps`テーブルに「AIチャット」アプリが存在するか確認
   - 存在しない場合は自動作成されます

3. **チャットセッションが作成できない**
   - 病院IDとアプリIDが正しく設定されているか確認
   - ログでエラーメッセージを確認

4. **チャットを送信できない**
   - セッションが正しく作成されているか確認
   - エラー表示を確認し、必要に応じて再試行

5. **案内チャットが表示されない**
   - 初期化時にセッション作成が失敗していないか確認
   - エラーメッセージを確認し、再試行ボタンをクリック

### デバッグ方法

1. ブラウザの開発者ツールでコンソールログを確認
2. Supabaseダッシュボードでテーブルデータを確認
3. ネットワークタブでAPIリクエストを確認
4. 開発環境のデバッグ情報を確認

### テスト用セットアップ

`scripts/test-ai-chat-setup.sql` を実行して、現在のデータベース状態を確認できます：

```sql
-- 現在の状態を確認
\i scripts/test-ai-chat-setup.sql
```

## 今後の改善点

1. **RLSポリシーの実装**: セキュリティ強化
2. **キャッシュ機能**: パフォーマンス向上
3. **リアルタイム更新**: WebSocket対応
4. **ファイルアップロード**: 画像・音声ファイルの保存
5. **検索機能**: メッセージの全文検索

## 関連ファイル

- `src/lib/chatService.ts` - チャットサービス
- `src/contexts/AuthContext.tsx` - 認証コンテキスト
- `src/app/AIchat/hooks/useChatSessions.ts` - チャットセッション管理
- `src/app/AIchat/page.tsx` - メインページ
- `src/types/auth.ts` - 認証型定義
- `scripts/init-ai-chat-tables.sql` - 初期化スクリプト
- `scripts/test-ai-chat-setup.sql` - テスト用セットアップスクリプト
