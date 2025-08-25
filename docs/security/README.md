# セキュリティドキュメント

## 概要
9病院・多職種向け院内業務基盤のセキュリティ関連ドキュメント

## 目次

### 📋 要件・設計
- [database-security-requirements.md](../requirements/database-security-requirements.md) - データベースセキュリティ要件

### 🔒 RLS（Row Level Security）
- [fix-rls-policies.sql](../../fix-rls-policies.sql) - RLSポリシー修正
- [fix-user-permissions.sql](../../fix-user-permissions.sql) - ユーザー権限修正
- [fix-chat-rls-emergency.sql](../../fix-chat-rls-emergency.sql) - チャットRLS緊急修正
- [fix-chat-rls-new-schema.sql](../../fix-chat-rls-new-schema.sql) - チャットRLS新スキーマ修正
- [fix-chat-sessions-rls.sql](../../fix-chat-sessions-rls.sql) - チャットセッションRLS修正
- [fix-chat-rls.sql](../../fix-chat-rls.sql) - チャットRLS修正
- [disable-rls-analytics.sql](../../disable-rls-analytics.sql) - 分析RLS無効化

### 🛡️ 認証・認可
- [auth-requirements.md](../requirements/auth-requirements.md) - 認証要件

### 🔍 検証・監査
- [check-foreign-keys.sql](../../check-foreign-keys.sql) - 外部キー確認
- [verify-database.sql](../../verify-database.sql) - データベース検証

## セキュリティ方針

### 現在の設定方針
- **アプローチ**: DBに合わせてコーディングを調整
- **理由**: 既存システムの安定性維持、段階的改善
- **リスクレベル**: 低

### 実装方針
1. 既存のRLS設定（auth.uid()ベース）を維持
2. アプリケーション層で詳細な権限チェックを実装
3. エラーハンドリングを強化

### 将来的な改善計画
- **Phase 1**: 現状維持 + エラーハンドリング強化
- **Phase 2**: フロントエンド権限チェック追加
- **Phase 3**: DBのRLS設定段階的強化

## 使用方法

### RLSポリシー修正
1. 該当する修正ファイルを確認
2. テスト環境で実行・検証
3. 本番環境で実行
4. 動作確認

### 権限確認
- `check-foreign-keys.sql` で整合性確認
- `verify-database.sql` で全体的な検証

## 注意事項
- セキュリティ設定変更前は必ずバックアップを取得
- テスト環境での十分な検証を実施
- 段階的な変更を推奨
- 監査ログの確認を定期実施
