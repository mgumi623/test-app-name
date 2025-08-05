'use client';
import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { ChangeEvent, FormEvent } from 'react';
import { MouseEvent } from 'react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Navigate to Select page
    window.location.href = '/Select';
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gray-400/10 rounded-full blur-2xl animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/8 rounded-full blur-2xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Modern card with subtle glassmorphism */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-black/90 to-gray-800/95 border border-gray-700/50 rounded-xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-lg mb-4 backdrop-blur-sm border border-white/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'ログイン' : '新規登録'}
              </h1>
              <p className="text-gray-400">
                {isLogin ? 'アカウントにサインインしてください' : '新しいアカウントを作成しましょう'}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Name field (only for signup) */}
              {!isLogin && (
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors duration-200" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                    placeholder="お名前"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email field */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
                  placeholder="メールアドレス"
                  required
                />
              </div>

              {/* Password field */}
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

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 bg-white text-black font-semibold rounded-lg transform transition-all duration-300 hover:scale-[1.02] hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
              >
                {isLogin ? 'ログイン' : '新規登録'}
              </button>
            </div>

            {/* Toggle between login/signup */}
            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-400 hover:text-white transition-colors duration-200 font-medium"
              >
                {isLogin ? 'アカウントをお持ちでない方はこちら' : '既にアカウントをお持ちの方はこちら'}
              </button>
            </div>

            {/* Forgot password (only for login) */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button className="text-gray-500 hover:text-gray-300 transition-colors duration-200 text-sm">
                  パスワードをお忘れですか？
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              © 2025 Koreha Maenaka ga Tukutta Yo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}