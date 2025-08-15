# Staff API Migration Guide

## 概要

この文書は、RIHA スケジュール管理システムのスタッフ管理機能をローカルストレージベースからSupabase APIベースに移行するためのガイドです。

## 変更内容

### 1. データストレージの変更
- **Before**: ローカルストレージ (`localStorage`)
- **After**: Supabase PostgreSQL データベース

### 2. 追加された機能

#### CRUD操作
- `createStaff(newStaff)`: 新しいスタッフを作成
- `updateStaff(id, updates)`: 既存スタッフの情報を更新
- `deleteStaff(id)`: スタッフを削除
- `fetchStaff()`: スタッフデータを再取得

#### フィルタリング・ソート機能
- `getStaffByTeam(team)`: 特定チームのスタッフを取得
- `getStaffByTeams(teams)`: 複数チームのスタッフを取得
- `getSortedStaff(field, direction, teamFilter)`: ソート済みスタッフリストを取得
- `searchStaff(query)`: 名前、チーム、役職、職種で検索
- `getStaffByYearsRange(minYears, maxYears)`: 経験年数範囲でフィルタ

#### エラーハンドリング
- `loading`: データロード状態
- `error`: エラー情報
- `clearError()`: エラーをクリア

## セットアップ手順

### 1. データベーステーブルの作成

Supabaseの SQL エディタで以下を実行：

```sql
-- staff-table-setup.sql の内容を実行
```

### 2. 環境変数の確認

`.env.local` ファイルに以下が設定されていることを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 使用例

### 基本的な使用方法（既存コードとの互換性）

```tsx
// 既存のコードはそのまま動作
import { useStaff } from '../contexts/StaffContext';

function StaffComponent() {
  const { staffList, loading, error } = useStaff();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error.message}</div>;

  return (
    <ul>
      {staffList.map(staff => (
        <li key={staff.id}>{staff.name} - {staff.team}</li>
      ))}
    </ul>
  );
}
```

### 新機能の使用例

#### スタッフの作成

```tsx
import { useStaff } from '../contexts/StaffContext';

function AddStaffForm() {
  const { createStaff } = useStaff();

  const handleSubmit = async (formData) => {
    try {
      const newStaff = await createStaff({
        name: formData.name,
        team: formData.team,
        position: formData.position,
        profession: formData.profession,
        years: formData.years
      });
      console.log('スタッフを作成しました:', newStaff);
    } catch (error) {
      console.error('作成失敗:', error);
    }
  };

  // フォームの実装...
}
```

#### チームフィルタリング

```tsx
import { useStaff } from '../contexts/StaffContext';

function TeamStaffList({ teamName }: { teamName: string }) {
  const { getStaffByTeam, loading } = useStaff();

  if (loading) return <div>読み込み中...</div>;

  const teamStaff = getStaffByTeam(teamName);

  return (
    <div>
      <h3>{teamName}チーム</h3>
      {teamStaff.map(staff => (
        <div key={staff.id}>
          {staff.name} - {staff.position} ({staff.years}年)
        </div>
      ))}
    </div>
  );
}
```

#### ソート機能

```tsx
import { useStaff } from '../contexts/StaffContext';

function SortedStaffList() {
  const { getSortedStaff } = useStaff();

  // 役職順でソート（主任 → 副主任 → 一般）
  const staffByPosition = getSortedStaff('position', 'desc');
  
  // 特定チームを経験年数順でソート
  const teamAStaffByYears = getSortedStaff('years', 'desc', '2A');

  return (
    <div>
      <h3>役職順</h3>
      {staffByPosition.map(staff => (
        <div key={staff.id}>
          {staff.name} - {staff.position}
        </div>
      ))}
    </div>
  );
}
```

#### 検索機能

```tsx
import { useState } from 'react';
import { useStaff } from '../contexts/StaffContext';

function StaffSearch() {
  const [query, setQuery] = useState('');
  const { searchStaff } = useStaff();

  const searchResults = searchStaff(query);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="スタッフを検索..."
      />
      {searchResults.map(staff => (
        <div key={staff.id}>
          {staff.name} - {staff.team} - {staff.profession}
        </div>
      ))}
    </div>
  );
}
```

#### エラーハンドリング

```tsx
import { useStaff } from '../contexts/StaffContext';

function StaffManagement() {
  const { 
    staffList, 
    loading, 
    error, 
    clearError, 
    updateStaff 
  } = useStaff();

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await updateStaff(id, updates);
      // 成功時の処理
    } catch (error) {
      // エラーは自動的にstateに設定される
      console.error('更新失敗:', error);
    }
  };

  return (
    <div>
      {error && (
        <div className="error">
          {error.message}
          <button onClick={clearError}>閉じる</button>
        </div>
      )}
      {/* スタッフリストの表示 */}
    </div>
  );
}
```

## マイグレーション時の注意点

### 1. 既存コードの互換性
- `staffList` と `setStaffList` は既存と同じインターフェース
- 既存のコンポーネントは変更なしで動作

### 2. データの移行
- 初回実行時、ローカルストレージのデータが存在しない場合は自動的に生成データがDBに保存される
- 既存のローカルデータは手動でDBに移行が必要な場合あり

### 3. エラーハンドリングの強化
- ネットワークエラー時はローカルストレージにフォールバック
- すべてのCRUD操作でエラーハンドリングが追加

### 4. パフォーマンス
- 初期ロード時に `loading` 状態を表示することを推奨
- フィルタ・ソート操作はクライアントサイドで実行（リアルタイム性重視）

## 型定義

```typescript
// SortField: ソート可能なフィールド
type SortField = 'name' | 'team' | 'position' | 'profession' | 'years';

// SortDirection: ソート方向
type SortDirection = 'asc' | 'desc';

// StaffStateError: エラー情報
interface StaffStateError {
  message: string;
  code?: string;
}
```

## トラブルシューティング

### Q: データベース接続エラーが発生する
A: 環境変数を確認し、Supabaseプロジェクトが正しく設定されているか確認してください。

### Q: RLS (Row Level Security) エラーが発生する
A: staff-table-setup.sql でポリシーが正しく設定されているか確認してください。

### Q: 既存のローカルデータが消えた
A: フォールバック機能により、データベース接続失敗時はローカルストレージが使用されます。

## パフォーマンス最適化のヒント

1. **バッチ操作**: 複数のCRUD操作を行う場合は、可能な限りバッチで実行
2. **クライアントサイドキャッシュ**: フィルタ・ソート操作はクライアントサイドで実行
3. **リアルタイム更新**: 必要に応じてSupabaseのリアルタイム機能を追加可能
4. **インデックス**: 頻繁に使用するクエリに対してデータベースインデックスが設定済み