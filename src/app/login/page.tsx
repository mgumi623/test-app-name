'use client';
import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { Eye, EyeOff, Lock, User, Bot } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  /* ----------------------------- Supabase client ---------------------------- */
  const supabase = createClientComponentClient();

  /* ------------------------------ React states ------------------------------ */
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ login_id: '', password: '' });

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({ login_id: '', newPassword: '', confirmPassword: '' });
  const [resetMessage, setResetMessage] = useState('');

  /* ------------------------------- Handlers -------------------------------- */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleResetInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setResetData({ ...resetData, [e.target.name]: e.target.value });

  /* --------------------------------- Login --------------------------------- */
  const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!formData.login_id || !formData.password) {
      alert('IDとパスワードを入力してください。');
      return;
    }

    const email = `${formData.login_id}@example.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: formData.password });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;
    const meta = user.user_metadata || {};

    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_name', meta.name || '');
    localStorage.setItem('user_role', meta.role || '');
    localStorage.setItem('user_permission', meta.permission || '');
    localStorage.setItem('is_authenticated', 'true');

    window.location.href = '/Select';
  };

  /* ---------------------------- Password Reset ----------------------------- */
  const handlePasswordReset = async () => {
    if (!resetData.newPassword || !resetData.confirmPassword) {
      setResetMessage('全ての項目を入力してください。');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setResetMessage('パスワードが一致しません。');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: resetData.newPassword,
    });

    if (error) {
      setResetMessage('変更失敗: ' + error.message);
    } else {
      setResetMessage('パスワードが正常に変更されました。');
      setResetData({ login_id: '', newPassword: '', confirmPassword: '' });
    }
  };

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
            <CardContent className="space-y-4">
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
                type="button"
                onClick={handleSubmit}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium text-base rounded-lg transition-colors"
              >
                サインイン
              </Button>

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

              {/* パスワードリセットフォーム */}
              {showResetForm && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border animate-fade-in-up">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">パスワードリセット</h3>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      name="login_id"
                      value={resetData.login_id}
                      onChange={handleResetInputChange}
                      placeholder="ユーザーID"
                      className="h-10 border-gray-200 focus:border-gray-300"
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      value={resetData.newPassword}
                      onChange={handleResetInputChange}
                      placeholder="新しいパスワード"
                      className="h-10 border-gray-200 focus:border-gray-300"
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={handleResetInputChange}
                      placeholder="パスワード確認"
                      className="h-10 border-gray-200 focus:border-gray-300"
                    />
                    <Button
                      type="button"
                      onClick={handlePasswordReset}
                      className="w-full h-10 bg-gray-700 hover:bg-gray-800 text-white text-sm rounded-md"
                    >
                      パスワードを更新
                    </Button>
                    {resetMessage && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">{resetMessage}</p>
                      </div>
                    )}
                  </div>
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