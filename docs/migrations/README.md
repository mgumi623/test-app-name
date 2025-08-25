# マイグレーション・修正ドキュメント

## 概要
9病院・多職種向け院内業務基盤のマイグレーション・修正関連ドキュメント

## 目次

### 📋 ガイド・手順
- [MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md) - マイグレーションガイド
- [STAFF_API_MIGRATION.md](../../STAFF_API_MIGRATION.md) - スタッフAPI移行ガイド

### 🔧 チャット機能修正
- [fix-chat-new-schema-complete.sql](../../fix-chat-new-schema-complete.sql) - チャット新スキーマ完全修正
- [fix-chat-rls-emergency.sql](../../fix-chat-rls-emergency.sql) - チャットRLS緊急修正
- [fix-chat-rls-new-schema.sql](../../fix-chat-rls-new-schema.sql) - チャットRLS新スキーマ修正
- [fix-chat-sessions-rls.sql](../../fix-chat-sessions-rls.sql) - チャットセッションRLS修正
- [fix-chat-rls.sql](../../fix-chat-rls.sql) - チャットRLS修正

### 🗄️ スキーマ変更
- [new-erd-migration.sql](../../new-erd-migration.sql) - 新ERD移行
- [recreate-analytics-tables.sql](../../recreate-analytics-tables.sql) - 分析テーブル再作成

### ⚙️ 設定更新
- [admin-settings-columns-update.sql](../../admin-settings-columns-update.sql) - 管理者設定列更新
- [settings-columns-update.sql](../../settings-columns-update.sql) - 設定列更新

### 🛠️ セキュリティ修正
- [fix-rls-policies.sql](../../fix-rls-policies.sql) - RLSポリシー修正
- [fix-user-permissions.sql](../../fix-user-permissions.sql) - ユーザー権限修正
- [disable-rls-analytics.sql](../../disable-rls-analytics.sql) - 分析RLS無効化

## 実行順序

### 緊急修正
1. `fix-chat-rls-emergency.sql` - チャットRLS緊急修正
2. `fix-chat-rls.sql` - チャットRLS修正

### 通常修正
1. `fix-rls-policies.sql` - RLSポリシー修正
2. `fix-user-permissions.sql` - ユーザー権限修正
3. `fix-chat-sessions-rls.sql` - チャットセッションRLS修正

### スキーマ更新
1. `new-erd-migration.sql` - 新ERD移行
2. `fix-chat-new-schema-complete.sql` - チャット新スキーマ完全修正
3. `recreate-analytics-tables.sql` - 分析テーブル再作成

### 設定更新
1. `admin-settings-columns-update.sql` - 管理者設定列更新
2. `settings-columns-update.sql` - 設定列更新

## 使用方法

### 修正実行前
1. バックアップを取得
2. テスト環境で実行・検証
3. 実行順序を確認

### 修正実行
1. 該当するSQLファイルを実行
2. エラーが発生した場合はロールバック
3. 動作確認を実施

### 修正実行後
1. データベース検証: `verify-database.sql`
2. 外部キー確認: `check-foreign-keys.sql`
3. アプリケーション動作確認

## 注意事項
- **必ずバックアップを取得してから実行**
- **テスト環境での十分な検証を実施**
- **実行順序を厳守**
- **エラー発生時は即座にロールバック**
- **本番環境での実行は慎重に**
