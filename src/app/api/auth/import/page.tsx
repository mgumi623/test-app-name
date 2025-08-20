'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ImportUsers() {
  const [status, setStatus] = useState('');

  const handleImport = async () => {
    try {
      setStatus('インポート中...');
      const response = await fetch('/api/import-users', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(`インポート完了: ${data.results.length}件のユーザーを登録しました`);
      } else {
        setStatus(`エラー: ${data.error}`);
      }
    } catch (error) {
      setStatus('インポートに失敗しました');
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">ユーザー一括登録</h1>
      <Button onClick={handleImport}>CSVからユーザーをインポート</Button>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}