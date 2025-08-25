# 開発・技術ドキュメント

## 概要
9病院・多職種向け院内業務基盤の開発・技術関連ドキュメント

## 目次

### 📋 要件・仕様
- [REQUIREMENTS.md](../../REQUIREMENTS.md) - 全体要件仕様
- [auth-requirements.md](../requirements/auth-requirements.md) - 認証要件
- [ui-requirements.md](../requirements/ui-requirements.md) - UI要件
- [ScrollingBackground-requirements.md](../requirements/ScrollingBackground-requirements.md) - スクロール背景要件

### 🚀 セットアップ・デプロイ
- [README.md](../../README.md) - プロジェクト概要・セットアップ
- [MIGRATION_GUIDE.md](../../MIGRATION_GUIDE.md) - マイグレーションガイド
- [STAFF_API_MIGRATION.md](../../STAFF_API_MIGRATION.md) - スタッフAPI移行ガイド

### 🤖 AI・チャット機能
- [DIFY_CHAT_README.md](../../DIFY_CHAT_README.md) - Difyチャット機能説明

### 🧪 テスト・検証
- [test-procedure.md](../../test-procedure.md) - テスト手順

### ⚙️ 設定・環境
- [package.json](../../package.json) - 依存関係
- [tsconfig.json](../../tsconfig.json) - TypeScript設定
- [next.config.ts](../../next.config.ts) - Next.js設定
- [eslint.config.mjs](../../eslint.config.mjs) - ESLint設定
- [components.json](../../components.json) - UIコンポーネント設定
- [vercel.json](../../vercel.json) - Vercel設定

## 使用方法

### 開発環境セットアップ
1. `README.md` を参照して環境構築
2. 依存関係をインストール: `npm install`
3. 環境変数を設定
4. 開発サーバー起動: `npm run dev`

### テスト実行
- `test-procedure.md` を参照してテストを実行

### デプロイ
- `vercel.json` の設定を確認
- Vercelにデプロイ

## 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **デプロイ**: Vercel

## 注意事項
- TypeScriptの型安全性を重視
- ESLintルールに従ってコーディング
- 環境変数の管理に注意
