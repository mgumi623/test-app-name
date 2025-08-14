'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Eye, EyeOff, Lock, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  /* ----------------------------- Auth context ---------------------------- */
  const { signIn } = useAuth();

  /* ------------------------------ React states ------------------------------ */
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ login_id: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetMessage] = useState('');

  /* ------------------------------- Handlers -------------------------------- */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  /* --------------------------------- Login --------------------------------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!formData.login_id || !formData.password) {
      setError('IDとパスワードを入力してください。');
      return;
    }

    setIsLoading(true);

    try {
      const email = `${formData.login_id}@example.com`;
      const result = await signIn(email, formData.password);

      if (result.error) {
        setError(result.error);
      }
    } catch {
      setError('ログインに失敗しました。再度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------- Password Reset ----------------------------- */

  /* --------------------------------- JSX ---------------------------------- */
  return (
    <>
      {/* AIChatスタイルのグローバルCSS */}
      <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in 0.5s ease-out }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards }
        ::-webkit-scrollbar { width: 8px }
        ::-webkit-scrollbar-track { background: #f1f5f9 }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8 }
      `}</style>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* ヘッダー部分 - AIChatスタイル */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 mb-4">
              <Bot className="w-8 h-8 text-gray-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">ログイン</h1>
            <p className="text-gray-600">病院管理システムにサインインしてください</p>
          </div>

          {/* ログインフォーム */}
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-medium text-gray-900">アカウント情報を入力</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* エラーメッセージ */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              {/* ユーザーID */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">ユーザーID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="login_id"
                    value={formData.login_id}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                    placeholder="IDを入力してください"
                    required
                  />
                </div>
              </div>

              {/* パスワード */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">パスワード</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-12 h-12 border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
                    placeholder="パスワードを入力してください"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

                {/* ログインボタン */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-base rounded-lg transition-colors"
                >
                  {isLoading ? '認証中...' : 'サインイン'}
                </Button>
              </form>

              {/* パスワードリセットリンク */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowResetForm(!showResetForm)}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium p-0 h-auto"
                >
                  パスワードをお忘れですか？
                </Button>
              </div>

              {/* パスワードリセットメッセージ */}
              {showResetForm && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border animate-fade-in-up">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">パスワードリセット</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    パスワードを忘れた場合は、システム管理者にお問い合わせください。
                  </p>
                  {resetMessage && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-700">{resetMessage}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* フッター */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">© 2025 Koreha Maenaka ga Tukutta Yo.</p>
          </div>
        </div>
      </div>
    </>
  );
}