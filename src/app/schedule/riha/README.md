# リハビリテーション部門 シフト管理システム

## 概要
リハビリテーション部門のシフト管理を行うシステムです。各チームのシフト作成、管理、表示を行います。

## 主な機能
1. チーム別シフト管理
2. 自動シフト生成
3. シフトルール設定
4. スタッフ管理

## フォルダ構成

### components/
- `ShiftTable.tsx`: シフト表示テーブルコンポーネント
- `ShiftCreation.tsx`: シフト作成画面コンポーネント
- `StaffList.tsx`: スタッフ一覧表示コンポーネント
- `TeamView.tsx`: チーム別ビューコンポーネント
- `AutoAssignButton.tsx`: シフト自動生成ボタンコンポーネント
- `PasswordDialog.tsx`: パスワード入力ダイアログ
- `ShiftEditModal.tsx`: シフト編集モーダル

### contexts/
- `StaffContext.tsx`: スタッフ情報の状態管理
- `TeamsContext.tsx`: チーム情報の状態管理
- `ShiftRulesContext.tsx`: シフトルールの状態管理

### utils/
- `shiftGenerator.ts`: シフト自動生成ロジック
- `validation.ts`: バリデーション関数
- `styles.ts`: スタイル定義

### types/
- `index.ts`: 型定義ファイル

### data/
- `staff.ts`: スタッフデータ関連の定義
- `generateStaffData.ts`: テストデータ生成

## データベーステーブル

### admin_settings
管理者設定を保存するテーブル
- weekly_five_shifts: 週5日勤務制の有効/無効
- weekly_sunday: 週の開始日を日曜にするかどうか

### shift_rules
シフトルールを管理するテーブル
- team_id: チームID
- position: 役職
- day_of_week: 曜日
- minimum_staff_count: 最小必要人数

### staff
スタッフ情報を管理するテーブル
- name: 名前
- team: 所属チーム
- position: 役職
- profession: 職種
- years: 経験年数

## シフト自動生成の仕様

### 基本ルール
1. 週に2日の休みを設定（weekly_five_shifts=trueの場合）
2. 週の開始日は設定により日曜または月曜
3. 上位2名（主任・副主任）は必ずどちらかが出勤
4. 休みはランダムに割り当て
5. 出勤は空白表示

### 制約条件
1. 一週間のうちに出勤以外の文字がない場合は背景色を赤く表示
2. スタッフリスト上位2名は交代で出勤を確保
3. 週の休み日数は設定に従う

## 使用方法

1. 初期設定
   - SQLファイルを実行してテーブルを作成
   - 管理者設定を構成

2. シフト作成
   - チームを選択
   - 「編集する」で編集モード開始
   - 「自動配置」でシフトを自動生成
   - 手動で調整
   - 「印刷する」で印刷プレビュー