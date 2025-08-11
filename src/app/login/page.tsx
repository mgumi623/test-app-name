'use client';
import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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

  /* ---------------------------- Password Reset ----------------------------- */
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50">
      {/* === Sophisticated background pattern === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:6rem_4rem]" />
        {/* Gradient orbs */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-200/20 to-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-l from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl" />
      </div>

      {/* === Premium Login Card === */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card className="backdrop-blur-2xl bg-white/95 border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 rounded-3xl overflow-hidden">
            {/* Subtle top accent */}
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
            
            <CardHeader className="text-center pt-12 pb-8 px-10">
              <div className="mx-auto mb-6 relative">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/20 to-green-600/20 rounded-3xl blur-xl -z-10" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">ログイン</CardTitle>
              <CardDescription className="text-slate-600 text-base font-medium">IDとパスワードでサインインしてください</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">

              <div className="space-y-8">
                {/* --- ID Field --- */}
                <div className="relative group">
                  <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-semibold text-slate-700 transition-colors group-focus-within:text-emerald-600">
                    ユーザーID
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-all duration-300" />
                  </div>
                  <Input
                    type="text"
                    name="login_id"
                    value={formData.login_id}
                    onChange={handleInputChange}
                    className="h-14 pl-12 pr-4 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl transition-all duration-300"
                    placeholder="IDを入力してください"
                    required
                  />
                </div>

                {/* --- Password Field --- */}
                <div className="relative group">
                  <label className="absolute -top-2 left-3 px-2 bg-white text-sm font-semibold text-slate-700 transition-colors group-focus-within:text-emerald-600">
                    パスワード
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-all duration-300" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-14 pl-12 pr-14 bg-slate-50/50 border-slate-200 hover:border-slate-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-slate-800 placeholder-slate-400 rounded-xl transition-all duration-300"
                    placeholder="パスワードを入力してください"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-slate-600 transition-all duration-200 hover:bg-transparent"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>

                {/* --- Login Button --- */}
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full h-14 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 rounded-xl"
                >
                  サインイン
                </Button>

                {/* --- Forgot Password Link --- */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowResetForm(!showResetForm)}
                    className="text-slate-600 hover:text-emerald-600 font-medium px-0 h-auto transition-colors duration-200 hover:bg-transparent"
                  >
                    パスワードをお忘れですか？
                  </Button>
                </div>

                {/* --- Password Reset Form --- */}
                {showResetForm && (
                  <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200/60 shadow-inner">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">パスワードリセット</h3>
                      <p className="text-sm text-slate-600">新しいパスワードを設定してください</p>
                    </div>
                    <Input
                      type="text"
                      name="login_id"
                      value={resetData.login_id}
                      onChange={handleResetInputChange}
                      placeholder="ユーザーID"
                      className="h-12 bg-white/70 border-slate-200 hover:border-slate-300 focus:border-emerald-400 text-slate-800 placeholder-slate-400 rounded-xl"
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      value={resetData.newPassword}
                      onChange={handleResetInputChange}
                      placeholder="新しいパスワード"
                      className="h-12 bg-white/70 border-slate-200 hover:border-slate-300 focus:border-emerald-400 text-slate-800 placeholder-slate-400 rounded-xl"
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={resetData.confirmPassword}
                      onChange={handleResetInputChange}
                      placeholder="パスワード確認"
                      className="h-12 bg-white/70 border-slate-200 hover:border-slate-300 focus:border-emerald-400 text-slate-800 placeholder-slate-400 rounded-xl"
                    />
                    <Button
                      type="button"
                      onClick={handlePasswordReset}
                      className="w-full h-12 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      パスワードを更新
                    </Button>
                    {resetMessage && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="text-sm text-emerald-700 text-center font-medium">{resetMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* --- Elegant Footer --- */}
          <div className="text-center mt-12">
            <p className="text-slate-500 text-sm font-medium">© 2025 Koreha Maenaka ga Tukutta Yo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
