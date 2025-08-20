# UI/UX機能 要件定義書

## 概要
S-BOTシステムのユーザーインターフェース機能に関する要件定義

## 機能要件

### UI-001: メイン画面（ログイン画面）
- **ファイル**: `src/components/ScrollingBackground.tsx`
- **機能**: ログイン画面のメインレイアウト
- **詳細**:
  - S-BOTロゴの表示（`/logoimage/s-bot-logo.png`）
  - 動的な背景アニメーション
  - 中央配置のログインボタン
  - レスポンシブデザイン対応

### UI-002: サイドバーナビゲーション
- **ファイル**: `src/components/ScrollingBackground.tsx`
- **機能**: 左側のナビゲーションメニュー
- **詳細**:
  - 開閉可能なサイドバー（幅: 256px/64px）
  - 階層化されたメニュー構造
  - ホバーエフェクト
  - モバイル対応

### UI-003: 背景アニメーション
- **ファイル**: `src/components/ScrollingBackground.tsx`
- **機能**: 動的な背景表示
- **詳細**:
  - 2行の横スクロール背景
  - 9つの医療施設画像の表示
  - シームレスな無限ループ
  - 60秒で1周のアニメーション

### UI-004: ログインボタン
- **ファイル**: `src/components/ScrollingBackground.tsx`
- **機能**: 中央配置のログインボタン
- **詳細**:
  - 白色のカプセル形状
  - 矢印アイコン付き
  - ホバーエフェクト
  - 中央配置（画面中央）

### UI-005: AIチャットページ
- **ファイル**: `src/app/AIchat/page.tsx`
- **機能**: AIチャット機能のメインページ
- **詳細**:
  - サイドバー（チャット履歴、新規チャット）
  - メインチャットエリア（メッセージ表示、入力欄）
  - ヘッダー（タイトル、ユーザー情報）
  - レスポンシブ対応

#### AIチャットページのレイアウト構造
```tsx
<AIChatPage>
  {/* サイドバー */}
  <Sidebar>
    <SidebarHeader />
    <ChatList />
    <NewChatButton />
  </Sidebar>
  
  {/* メインコンテンツ */}
  <MainChatArea>
    <ChatHeader />
    <MessageList />
    <MessageInput />
  </MainChatArea>
</AIChatPage>
```

#### AIチャットページのデザイン仕様
```css
/* チャットページ全体 */
.chat-page {
  display: flex;
  height: 100vh;
  background: #f8faf9;
}

/* サイドバー */
.chat-sidebar {
  width: 320px;
  background: #e8f2ed;
  border-right: 1px solid #cce3d9;
  display: flex;
  flex-direction: column;
}

/* メインチャットエリア */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

/* チャットヘッダー */
.chat-header {
  background: linear-gradient(135deg, #2d513f 0%, #3a6b5a 100%);
  color: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #cce3d9;
}

/* メッセージリスト */
.message-list {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f8faf9;
}

/* メッセージ入力エリア */
.message-input {
  padding: 1.5rem 2rem;
  background: white;
  border-top: 1px solid #e8f2ed;
}
```

#### AIチャットページのコンポーネント仕様

##### メッセージアイテム
```css
/* ユーザーメッセージ */
.user-message {
  background: linear-gradient(135deg, #2d513f 0%, #3a6b5a 100%);
  color: white;
  border-radius: 1rem 1rem 0.25rem 1rem;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  max-width: 70%;
  margin-left: auto;
  box-shadow: 0 2px 4px rgba(45, 81, 63, 0.2);
}

/* AIメッセージ */
.ai-message {
  background: white;
  color: #2d513f;
  border: 1px solid #e8f2ed;
  border-radius: 1rem 1rem 1rem 0.25rem;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
  max-width: 70%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* タイピングインジケーター */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  color: #666;
  font-style: italic;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #2d513f;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}
```

##### 入力フィールド
```css
/* メッセージ入力 */
.message-input-field {
  border: 2px solid #e8f2ed;
  border-radius: 2rem;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  resize: none;
  transition: all 0.3s ease;
  background: white;
  min-height: 3rem;
  max-height: 8rem;
}

.message-input-field:focus {
  border-color: #2d513f;
  box-shadow: 0 0 0 3px rgba(45, 81, 63, 0.1);
  outline: none;
}

/* 送信ボタン */
.send-button {
  background: linear-gradient(135deg, #2d513f 0%, #3a6b5a 100%);
  color: white;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(45, 81, 63, 0.2);
}

.send-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(45, 81, 63, 0.3);
}
```

##### サイドバーコンポーネント
```css
/* チャット履歴アイテム */
.chat-history-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #cce3d9;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-history-item:hover {
  background: #dbe9e3;
}

.chat-history-item.active {
  background: #2d513f;
  color: white;
}

/* 新規チャットボタン */
.new-chat-button {
  background: linear-gradient(135deg, #2d513f 0%, #3a6b5a 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 1rem 1.5rem;
  margin: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(45, 81, 63, 0.2);
}

.new-chat-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(45, 81, 63, 0.3);
}
```

#### AIチャットページのレスポンシブ対応
```css
/* デスクトップ（1024px以上） */
.chat-sidebar { width: 320px; }
.chat-main { margin-left: 320px; }

/* タブレット（768px-1023px） */
@media (max-width: 1024px) {
  .chat-sidebar { width: 280px; }
  .chat-main { margin-left: 280px; }
}

/* モバイル（767px以下） */
@media (max-width: 768px) {
  .chat-sidebar { 
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
    z-index: 1000;
  }
  
  .chat-sidebar.open { left: 0; }
  
  .chat-main { margin-left: 0; }
  
  .message-list { padding: 1rem; }
  
  .user-message, .ai-message { max-width: 90%; }
}
```

#### AIチャットページのアニメーション
```css
/* メッセージアニメーション */
@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item {
  animation: messageSlideIn 0.5s ease-out;
}

/* タイピングアニメーション */
@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.typing-dot:nth-child(1) { animation-delay: 0s; }
.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
```

## 技術要件

### フレームワーク
- **技術**: Next.js 14 (App Router)
- **理由**: 高速なページ読み込み、SEO対応

### スタイリング
- **技術**: Tailwind CSS
- **理由**: 高速な開発、一貫したデザイン、レスポンシブ対応

### コンポーネントライブラリ
- **技術**: shadcn/ui
- **理由**: 高品質なUIコンポーネント、カスタマイズ性

## 全ページ共通デザインガイドライン

### デザインシステム
- **ブランドカラー**: 医療施設向けの信頼感と清潔感を表現
- **デザイン原則**: シンプル、直感的、アクセシブル
- **統一感**: 全ページで一貫したデザイン言語の使用

### 共通レイアウト構造
```css
/* 全ページ共通の基本レイアウト */
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ヘッダー共通スタイル */
.header {
  background: linear-gradient(135deg, #2d513f 0%, #3a6b5a 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* メインコンテンツエリア */
.main-content {
  flex: 1;
  padding: 2rem;
  background: #f8faf9;
}

/* フッター共通スタイル */
.footer {
  background: #2d513f;
  color: white;
  padding: 1rem 2rem;
  text-align: center;
}
```

### 共通コンポーネント仕様

#### ボタン
```css
/* プライマリボタン */
.btn-primary {
  background: linear-gradient(135deg, #2d513f 0%, #3a6b5a 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(45, 81, 63, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(45, 81, 63, 0.3);
}

/* セカンダリボタン */
.btn-secondary {
  background: white;
  color: #2d513f;
  border: 2px solid #2d513f;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #2d513f;
  color: white;
}
```

#### カード
```css
/* 基本カード */
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border: 1px solid #e8f2ed;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

/* 医療施設向けカード */
.medical-card {
  background: linear-gradient(135deg, #f8faf9 0%, #e8f2ed 100%);
  border-left: 4px solid #2d513f;
}
```

#### フォーム要素
```css
/* 入力フィールド */
.input-field {
  border: 2px solid #e8f2ed;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.input-field:focus {
  border-color: #2d513f;
  box-shadow: 0 0 0 3px rgba(45, 81, 63, 0.1);
  outline: none;
}

/* ラベル */
.label {
  color: #2d513f;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
```

### 共通アニメーション
```css
/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* スライドイン */
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.slide-in {
  animation: slideIn 0.5s ease-out;
}
```

### 共通アイコンセット
```css
/* 医療関連アイコン */
.icon-medical {
  color: #2d513f;
  font-size: 1.25rem;
}

.icon-success {
  color: #10b981;
}

.icon-warning {
  color: #f59e0b;
}

.icon-error {
  color: #ef4444;
}
```

## デザイン仕様

### カラーパレット
```css
/* メインカラー */
--primary: #2d513f;      /* 深緑 */
--secondary: #e8f2ed;    /* 薄緑 */
--accent: #cce3d9;       /* アクセント緑 */

/* テキストカラー */
--text-primary: #000000; /* 黒 */
--text-secondary: #666666; /* グレー */

/* 背景色 */
--bg-primary: #ffffff;   /* 白 */
--bg-secondary: #f5f5f5; /* 薄グレー */
```

### タイポグラフィ
```css
/* ロゴ下のテキスト */
.title-large: text-2xl font-bold;    /* 業務改善統合アプリケーション */
.title-medium: text-xl;              /* 定型業務の時間短縮化ツール */

/* サイドバーテキスト */
.sidebar-title: text-lg font-semibold;
.sidebar-text: text-sm;
```

### レイアウト仕様
```css
/* サイドバー */
.sidebar: w-64 bg-[#e8f2ed] border-r border-[#cce3d9];
.sidebar-collapsed: w-16;

/* メインコンテンツ */
.main-content: ml-64 h-full;
.main-content-collapsed: ml-16;

/* 背景画像 */
.image-container: h-28vh (desktop), h-22vh (tablet), h-18vh (mobile);
```

## レスポンシブ要件

### デスクトップ（1024px以上）
- サイドバー: 256px幅
- 背景画像: 28vh高さ
- ロゴ: h-32（128px）

### タブレット（768px-1023px）
- サイドバー: 256px幅
- 背景画像: 22vh高さ
- ロゴ: h-24（96px）

### モバイル（767px以下）
- サイドバー: 非表示
- 背景画像: 18vh高さ
- ロゴ: h-20（80px）

## アニメーション仕様

### 横スクロールアニメーション
```css
@keyframes scrollLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scrollRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

.animation-duration: 60s;
.animation-timing: linear;
.animation-iteration: infinite;
```

### ホバーエフェクト
```css
.button-hover: hover:scale-105 transition-all duration-300;
.image-hover: hover:scale-1.05 transition-transform duration-300;
```

## アクセシビリティ要件

### キーボードナビゲーション
- Tabキーでのフォーカス移動
- Enterキーでのボタン操作
- Escapeキーでのサイドバー閉じる

### スクリーンリーダー対応
- 適切なalt属性
- ARIAラベルの設定
- セマンティックなHTML構造

### 色覚異常対応
- 色だけでなく形状でも情報を表現
- 十分なコントラスト比の確保

## パフォーマンス要件

### 画像最適化
- WebP形式の使用
- 遅延読み込み（lazy loading）
- 適切なサイズでの表示

### アニメーション最適化
- CSS transformの使用
- GPUアクセラレーションの活用
- フレームレートの最適化

## テスト要件

### 機能テスト
- サイドバーの開閉動作
- ログインボタンのクリック動作
- 背景アニメーションの動作確認

### レスポンシブテスト
- 各デバイスサイズでの表示確認
- 画面回転時の動作確認
- タッチ操作の確認

### アクセシビリティテスト
- キーボードナビゲーションの確認
- スクリーンリーダーでの読み上げ確認
- 色覚異常シミュレーションでの確認

## 受け入れ基準

### ACC-UI-001: レイアウト
- デスクトップ、タブレット、モバイルで正常に表示されること
- サイドバーの開閉が正常に動作すること
- ログインボタンが画面中央に配置されること

### ACC-UI-002: アニメーション
- 背景画像がシームレスにスクロールすること
- 60秒で1周するアニメーションが動作すること
- ホバーエフェクトが正常に動作すること

### ACC-UI-003: レスポンシブ
- 各デバイスサイズで適切に表示されること
- 画面サイズ変更時にレイアウトが調整されること

## 将来拡張計画

### 短期計画（1ヶ月以内）
- ダークモードの実装
- アニメーション速度の調整機能

### 中期計画（3ヶ月以内）
- カスタムテーマ機能
- 高度なアニメーション効果

---

**文書情報**
- **作成日**: 2024年12月
- **作成者**: 開発チーム
- **バージョン**: 1.0
- **関連ファイル**: `src/components/ScrollingBackground.tsx`
