/**
 * このファイルはデータベースエラー表示用のコンポーネントを提供します。
 * 
 * 主な機能：
 * - データベース接続エラーの表示
 * - テーブル未作成エラーの特別な処理
 * - エラーメッセージの整形と表示
 * - Supabaseダッシュボードへのリンク
 * 
 * UI機能：
 * - エラータイプに応じた異なる表示
 * - セットアップ手順の表示
 * - 再試行ボタン（オプション）
 * - レスポンシブなカードレイアウト
 */

'use client';

import React from 'react';
import { AlertTriangle, Database, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DatabaseErrorProps {
  error: string;
  onRetry?: () => void;
}

export const DatabaseError: React.FC<DatabaseErrorProps> = ({ error, onRetry }) => {
  const isTableNotFoundError = error.includes('relation') && error.includes('does not exist');
  
  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-xl font-semibold text-foreground mb-2">
          データベース接続エラー
        </h1>
        
        {isTableNotFoundError ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              データベーステーブルが見つかりません。<br />
              Supabaseにテーブルを作成する必要があります。
            </p>
            
            <div className="bg-muted/50 border border-border rounded p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4" />
                <span className="font-medium text-sm">設定手順:</span>
              </div>
              <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
                <li>Supabaseダッシュボードにログイン</li>
                <li>SQL Editorを開く</li>
                <li>プロジェクトルートの database-setup.sql を実行</li>
                <li>このページをリロード</li>
              </ol>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                variant="default"
                size="sm"
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabaseダッシュボードを開く
              </Button>
              
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  再試行
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              データベースへの接続に失敗しました。
            </p>
            
            <div className="bg-muted/50 border border-border rounded p-3 text-left">
              <p className="text-xs text-muted-foreground font-mono break-all">
                {error}
              </p>
            </div>
            
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="w-full"
              >
                再試行
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseError;