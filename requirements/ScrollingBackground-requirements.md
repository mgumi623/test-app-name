# ScrollingBackground コンポーネント 要件定義書

## 概要
S-BOTシステムのメイン背景コンポーネントに関する詳細要件定義

## ファイル情報
- **ファイル名**: `src/components/ScrollingBackground.tsx`
- **コンポーネント名**: `ScrollingBackground`
- **役割**: メインログイン画面の背景とレイアウト管理

## 機能要件

### BG-001: 背景画像スクロール
- **機能**: 医療施設画像の横スクロール表示
- **詳細**:
  - 2行の横スクロール背景
  - 1行目: 4枚の画像（岸和田リハ.jpg, 宇治脳卒中リハ.png, 川西リハ.jpg, 阪神リハ.png）
  - 2行目: 5枚の画像（伊丹せいふう.png, 大阪たつみ.jpg, 奈良町りは.jpg, 登美ヶ丘リハ.jpg, 彩都リハ.jpg）
  - シームレスな無限ループ
  - 60秒で1周のアニメーション

### BG-002: S-BOTロゴ表示
- **機能**: ロゴとタイトルテキストの表示
- **詳細**:
  - ロゴ画像: `/logoimage/s-bot-logo.png`
  - ロゴサイズ: h-32（128px）
  - タイトル: "業務改善統合アプリケーション"（text-2xl font-bold）
  - 位置: 画面上部中央（top-8）

### BG-003: ログインボタン
- **機能**: 中央配置のログインボタン
- **詳細**:
  - 白色のカプセル形状（rounded-full）
  - 矢印アイコン付き
  - ホバーエフェクト（hover:scale-105）
  - 位置: 画面中央（top-1/2 left-1/2）

### BG-004: サイドバーナビゲーション
- **機能**: 左側のナビゲーションメニュー
- **詳細**:
  - 開閉可能なサイドバー
  - 幅: 256px（開）/ 64px（閉）
  - 背景色: #e8f2ed
  - メニュー構造:
    - ログイン
    - [はじめに] S-BOTとは, できること
    - [運用] FAQ, お問い合わせ, リリースノート

## 技術仕様

### 使用技術
```typescript
// 主要なインポート
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 状態管理
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
```

### 画像ファイル構成
```typescript
// 1行目の画像（4枚）
const firstRow = [
  '/image/岸和田リハ.jpg',
  '/image/宇治脳卒中リハ.png',
  '/image/川西リハ.jpg',
  '/image/阪神リハ.png'
];

// 2行目の画像（5枚）
const secondRow = [
  '/image/伊丹せいふう.png',
  '/image/大阪たつみ.jpg',
  '/image/奈良町りは.jpg',
  '/image/登美ヶ丘リハ.jpg',
  '/image/彩都リハ.jpg'
];
```

### CSSアニメーション仕様
```css
/* 横スクロールアニメーション */
@keyframes scrollLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes scrollRight {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

/* アニメーション適用 */
.first-row {
  animation: scrollLeft 60s linear infinite;
}

.second-row {
  animation: scrollRight 60s linear infinite;
}
```

## レイアウト構造

### コンポーネント構造
```tsx
<ScrollingBackground>
  {/* サイドバー */}
  <div className="sidebar">
    <SidebarHeader />
    <SidebarContent />
  </div>
  
  {/* メインコンテンツ */}
  <div className="main-content">
    {/* S-BOTロゴとタイトル */}
    <div className="logo-section">
      <img src="/logoimage/s-bot-logo.png" />
      <div className="title">業務改善統合アプリケーション</div>
    </div>
    
    {/* 背景画像スクロール */}
    <div className="scrolling-images-container">
      <div className="first-row">...</div>
      <div className="second-row">...</div>
    </div>
    
    {/* ログインボタン */}
    <div className="login-button">
      <Button>ログイン</Button>
    </div>
  </div>
</ScrollingBackground>
```

### レスポンシブ対応
```css
/* デスクトップ（1024px以上） */
.sidebar { width: 256px; }
.main-content { margin-left: 256px; }
.image-container { height: 28vh; }

/* タブレット（768px-1023px） */
@media (max-width: 1024px) {
  .sidebar { width: 256px; }
  .main-content { margin-left: 256px; }
  .image-container { height: 22vh; }
}

/* モバイル（767px以下） */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { margin-left: 0; }
  .image-container { height: 18vh; }
}
```

## 状態管理

### サイドバー状態
```typescript
interface SidebarState {
  isOpen: boolean;
  width: 'w-64' | 'w-16';
  mainContentMargin: 'ml-64' | 'ml-16';
}
```

### 画像読み込み状態
```typescript
interface ImageState {
  loaded: boolean;
  error: string | null;
}
```

## エラーハンドリング

### 画像読み込みエラー
- 画像ファイルが見つからない場合の代替表示
- ネットワークエラー時のフォールバック
- 画像破損時のエラーメッセージ表示

### アニメーションエラー
- CSSアニメーションがサポートされていない場合の代替表示
- パフォーマンス問題時のアニメーション無効化

## パフォーマンス要件

### 画像最適化
- 遅延読み込み（lazy loading）の実装
- 適切な画像サイズでの表示
- WebP形式の使用（対応ブラウザの場合）

### アニメーション最適化
- CSS transformの使用
- GPUアクセラレーションの活用
- フレームレートの最適化（60fps）

### メモリ使用量
- 画像の適切なキャッシュ管理
- 不要なリソースの解放
- メモリリークの防止

## アクセシビリティ要件

### キーボードナビゲーション
- Tabキーでのフォーカス移動
- Enterキーでのボタン操作
- Escapeキーでのサイドバー閉じる

### スクリーンリーダー対応
- 適切なalt属性の設定
- ARIAラベルの設定
- セマンティックなHTML構造

### 色覚異常対応
- 十分なコントラスト比の確保
- 色だけでなく形状でも情報を表現

## テスト要件

### 機能テスト
- サイドバーの開閉動作確認
- ログインボタンのクリック動作確認
- 背景アニメーションの動作確認
- 画像の正常な読み込み確認

### レスポンシブテスト
- 各デバイスサイズでの表示確認
- 画面回転時の動作確認
- タッチ操作の確認

### パフォーマンステスト
- ページ読み込み時間の測定
- メモリ使用量の確認
- アニメーションのフレームレート確認

### アクセシビリティテスト
- キーボードナビゲーションの確認
- スクリーンリーダーでの読み上げ確認
- 色覚異常シミュレーションでの確認

## 受け入れ基準

### ACC-BG-001: 背景アニメーション
- 2行の画像がシームレスにスクロールすること
- 60秒で1周するアニメーションが動作すること
- 画像が正常に表示されること

### ACC-BG-002: レイアウト
- S-BOTロゴが画面上部中央に表示されること
- ログインボタンが画面中央に配置されること
- サイドバーが正常に開閉できること

### ACC-BG-003: レスポンシブ
- デスクトップ、タブレット、モバイルで適切に表示されること
- 画面サイズ変更時にレイアウトが調整されること

### ACC-BG-004: パフォーマンス
- ページ読み込み時間が3秒以内であること
- アニメーションが60fpsで動作すること
- メモリリークが発生しないこと

## 将来拡張計画

### 短期計画（1ヶ月以内）
- アニメーション速度の調整機能
- 画像のプリロード機能
- エラーハンドリングの強化

### 中期計画（3ヶ月以内）
- カスタムテーマ機能
- 高度なアニメーション効果
- パフォーマンス最適化

---

**文書情報**
- **作成日**: 2024年12月
- **作成者**: 開発チーム
- **バージョン**: 1.0
- **関連ファイル**: `src/components/ScrollingBackground.tsx`
