# Dify Chat with Image Support

Next.js (App Router) + TypeScript + Tailwind を使用した、画像アップロード対応のDifyチャットアプリケーション。

## 機能

- ✅ 画像付きチャット（JPG/PNG/WebP, 5MB以下）
- ✅ SSEストリーミングによる逐次応答表示
- ✅ conversation_id管理（localStorage保存）
- ✅ 画像プレビュー機能
- ✅ サーバーサイドでのAPIキー管理
- ✅ モバイルレスポンシブ対応

## アーキテクチャ

### API Flow
```
クライアント → POST /api/dify/chat → Dify Chat Flow API
          ↑                          ↓
        SSE ←─────── SSE Relay ←──────┘
```

### ファイル構成
```
src/
├── app/
│   ├── api/dify/chat/route.ts      # Dify APIプロキシ
│   └── chat/page.tsx               # チャット画面
├── components/
│   └── ImagePreview.tsx            # 画像プレビュー
└── hooks/
    ├── useConversation.ts          # conversation_id管理
    └── useStreamingChat.ts         # SSEストリーミング
```

## セットアップ

### 1. 環境変数設定
`.env.local` ファイルを作成：

```env
# Dify API Configuration
DIFY_API_BASE=https://api.dify.ai
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DIFY_CHAT_APP_ID=your-app-id-here
DIFY_DEFAULT_USER_ID=default-user-001
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 開発サーバー起動
```bash
npm run dev
```

### 4. チャット画面にアクセス
http://localhost:3000/chat

## API仕様

### POST /api/dify/chat

**リクエスト (multipart/form-data):**
- `text`: メッセージテキスト
- `image`: 画像ファイル（オプション）
- `conversationId`: 会話ID（オプション）
- `userId`: ユーザーID（オプション）

**レスポンス (SSE):**
```
data: {"answer": "応答テキストの一部", "conversation_id": "xxxx"}
data: {"answer": "続きのテキスト"}
data: [DONE]
```

## Dify設定要件

1. **Chat Flow** アプリケーションを作成
2. **Vision Model** を有効化（画像解析用）
3. **Files** 入力を追加（画像アップロード用）
4. **API Key** を取得
5. **response_mode** を `streaming` に設定

## 制限事項

- 画像形式: JPG, PNG, WebP のみ
- ファイルサイズ: 5MB以下
- 同時アップロード: 1ファイルまで
- ブラウザ要件: SSE対応ブラウザ

## トラブルシューティング

### 1. 画像がアップロードできない
- ファイル形式を確認（JPG/PNG/WebP）
- ファイルサイズを確認（5MB以下）
- ブラウザのコンソールでエラーを確認

### 2. ストリーミングが動作しない
- ネットワーク環境を確認
- Dify APIキーを確認
- サーバーログでエラーを確認

### 3. conversation_idが保存されない
- ブラウザのlocalStorageが有効か確認
- プライベートブラウジングモードでないか確認

## 実装の詳細

### SSE実装
- Server: Dify APIからのストリームをそのまま中継
- Client: ReadableStreamを使用してリアルタイム表示

### 画像処理
- FormDataでマルチパート送信
- Object URLで画像プレビュー
- メモリリーク防止のためURL cleanup

### 状態管理
- React Hooks（useState, useEffect）
- localStorage for conversation persistence
- Custom hooks for reusability

## 変更履歴

- v1.0.0: 初回実装（画像対応、SSE、conversation管理）
