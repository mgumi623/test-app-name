'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

const ID_DOMAIN = process.env.NEXT_PUBLIC_LOGIN_ID_DOMAIN ?? 'corp.local';
const toEmail = (loginId: string) => `${loginId}@${ID_DOMAIN}`;

export default function AuthTest() {
  const { signUp, signIn, signOut, user, profile, error, clearAuthError } = useAuth();

  // ⬇ ここを「メール」→「社員ID(loginId)」に変更
  const [loginId, setLoginId] = useState('12345');
  const [password, setPassword] = useState('StrongPassw0rd!');
  const [name, setName] = useState('テストユーザー');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSignUp = async () => {
    setIsLoading(true);
    setResult(null);
    clearAuthError();

    try {
      const email = toEmail(loginId); // 社員ID→メール化
      const { user, error } = await signUp(email, password, name);

      if (error) {
        setResult({ success: false, message: `サインアップエラー: ${error}` });
      } else if (user) {
        setResult({ success: true, message: `サインアップ成功: ${user.email}` });
      }
    } catch (err) {
      setResult({
        success: false,
        message: `例外エラー: ${err instanceof Error ? err.message : '不明なエラー'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setResult(null);
    clearAuthError();

    try {
      const email = toEmail(loginId); // 社員ID→メール化
      const { user, error } = await signIn(email, password);

      if (error) {
        setResult({ success: false, message: `ログインエラー: ${error}` });
      } else if (user) {
        setResult({ success: true, message: `ログイン成功: ${user.email}` });
      }
    } catch (err) {
      setResult({
        success: false,
        message: `例外エラー: ${err instanceof Error ? err.message : '不明なエラー'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setResult(null);
    clearAuthError();

    try {
      await signOut();
      setResult({ success: true, message: 'ログアウト成功' });
    } catch (err) {
      setResult({
        success: false,
        message: `ログアウトエラー: ${err instanceof Error ? err.message : '不明なエラー'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase認証テスト（社員IDログイン）</CardTitle>
          <CardDescription>
            社員ID + パスワードでサインアップ／ログインをテストします。
            実際は <code>@{ID_DOMAIN}</code> を付けてメールとして送信します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="loginId">ユーザーID（社員ID）</Label>
            <Input
              id="loginId"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="例: 12345"
            />
            <div className="text-xs text-muted-foreground">
              実際に送信されるメール: <code>{toEmail(loginId)}</code>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="StrongPassw0rd!"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">名前（サインアップ時のみ）</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="テストユーザー"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSignUp} disabled={isLoading} variant="outline" className="flex-1">
              {isLoading ? '処理中...' : 'サインアップ'}
            </Button>

            <Button onClick={handleSignIn} disabled={isLoading} className="flex-1">
              {isLoading ? '処理中...' : 'ログイン'}
            </Button>
          </div>

          {user && (
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? '処理中...' : 'ログアウト'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 結果表示 */}
      {result && (
        <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription className={result.success ? 'text-green-700' : 'text-red-700'}>
            {result.message}
          </AlertDescription>
        </Alert>
      )}

      {/* エラー表示（AuthProviderからのerror） */}
      {error && (
        <Alert className="border-red-500">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* 現在の状態表示 */}
      <Card>
        <CardHeader>
          <CardTitle>現在の状態</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <strong>ユーザー:</strong> {user ? user.email : '未ログイン'}
          </div>
          <div>
            <strong>プロフィール:</strong> {profile ? profile.name : 'なし'}
          </div>
          <div>
            <strong>ユーザーID:</strong> {user ? user.id : 'なし'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
