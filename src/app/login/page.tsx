'use client';
import React, { useState, ChangeEvent, MouseEvent } from 'react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* === Animated background === */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-400/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/8 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '3s' }}
        />
      </div>

      {/* === Card === */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 border border-gray-700/50 rounded-xl p-8 shadow-2xl hover:scale-[1.02] hover:shadow-3xl transition-all duration-300">
            {/* ---- Header ---- */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-lg mb-4 border border-white/20 backdrop-blur-sm">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">ログイン</h1>
              <p className="text-gray-400">IDとパスワードでサインインしてください</p>
            </div>

            {/* ---- Form ---- */}
            <div className="space-y-6">
              {/* --- ID --- */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  name="login_id"
                  value={formData.login_id}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  placeholder="ユーザーID"
                  required
                />
              </div>

              {/* --- Password --- */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  placeholder="パスワード"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* --- Login button --- */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 bg-white text-black font-semibold rounded-lg transform transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                ログイン
              </button>

              {/* --- Toggle reset form --- */}
              <button
                type="button"
                onClick={() => setShowResetForm(!showResetForm)}
                className="text-sm w-full py-4 bg-transparent text-rose-300 font-semibold rounded-lg transform transition-all duration-300 hover:scale-[1.02] hover:text-rose-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                パスワードを忘れた方はこちら
              </button>

              {/* --- Reset form --- */}
              {showResetForm && (
                <div className="space-y-4 mt-6 bg-white/5 p-4 rounded-lg">
                  <input
                    type="text"
                    name="login_id"
                    value={resetData.login_id}
                    onChange={handleResetInputChange}
                    placeholder="ユーザーID"
                    className="w-full px-4 py-2 rounded bg-black/20 text-white placeholder-gray-400"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    value={resetData.newPassword}
                    onChange={handleResetInputChange}
                    placeholder="新しいパスワード"
                    className="w-full px-4 py-2 rounded bg-black/20 text-white placeholder-gray-400"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={resetData.confirmPassword}
                    onChange={handleResetInputChange}
                    placeholder="パスワード再入力"
                    className="w-full px-4 py-2 rounded bg-black/20 text-white placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="w-full py-2 bg-white text-black font-semibold rounded hover:bg-gray-200"
                  >
                    パスワードを変更する
                  </button>
                  {resetMessage && (
                    <p className="text-sm text-rose-400 text-center">{resetMessage}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* --- Footer --- */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">© 2025 Koreha Maenaka ga Tukutta Yo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
