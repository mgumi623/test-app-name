'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, Lock, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ScrollingBackground from '@/components/ScrollingBackground';

export default function LoginPage() {
  const router = useRouter();

  /* ------------------------------ React states ------------------------------ */
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ staff_id: '', password: '' });
  const { profile, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authTimeout, setAuthTimeout] = useState(false);

  const [showResetForm, setShowResetForm] = useState(false);
  const [resetMessage] = useState('');

  // 認証状態のデバッグ情報を出力
  console.log('[LoginPage] Auth state:', {
    user: user ? 'exists' : 'null',
    profile: profile ? 'exists' : 'null',
    authLoading,
    userEmail: user?.email,
    userName: profile?.name
  });

  // 環境変数の確認（開発時のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('[LoginPage] Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    });
  }

  // 認証タイムアウトの処理
  React.useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        setAuthTimeout(true);
      }, 10000); // 10秒でタイムアウト

      return () => clearTimeout(timeout);
    } else {
      setAuthTimeout(false);
    }
  }, [authLoading]);

  /* ------------------------------- Handlers -------------------------------- */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });


  /* --------------------------------- Login --------------------------------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    console.log('[Login] Starting login process');
    
    if (!formData.staff_id || !formData.password) {
      setError('IDとパスワードを入力してください。');
      return;
    }

    // 入力検証の強化
    const sanitizedStaffId = formData.staff_id.trim();
    const sanitizedPassword = formData.password;
    
    console.log('[Login] Input validation passed', { staffId: sanitizedStaffId });
    
    // スタッフIDの形式検証（数字のみ許可）
    if (!/^\d+$/.test(sanitizedStaffId)) {
      setError('ユーザーIDは数字のみで入力してください。');
      return;
    }
    
    // パスワードの最小長検証
    if (sanitizedPassword.length < 1) {
      setError('パスワードを入力してください。');
      return;
    }

    setIsLoading(true);
    console.log('[Login] Attempting Supabase authentication');

    try {
      const email = `${sanitizedStaffId}@example.com`;
      console.log('[Login] Using email:', email);
      
      // Supabase接続テスト
      console.log('[Login] Testing Supabase connection...');
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('[Login] Supabase connection test:', { testData, testError });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: sanitizedPassword
      });

      console.log('[Login] Supabase response:', { data, error });

      if (error) {
        console.error('[Login] Authentication error:', error);
        setError('IDまたはパスワードが間違っています');
        return;
      }

      if (data?.user) {
        // ログイン成功後、プロファイルデータの取得を待機
        console.log('[Login] Login successful, user:', data.user);
        console.log('[Login] Waiting for AuthContext to handle redirect');
        // AuthContextがサインインイベントを検知して自動的にリダイレクトします
      }
    } catch (error) {
      console.error('[Login] Unexpected error:', error);
      setError('ログインに失敗しました。再度お試しください。');
    } finally {
      setIsLoading(false);
      console.log('[Login] Login process completed');
    }
  };

  /* ---------------------------- Password Reset ----------------------------- */

  /* --------------------------------- JSX ---------------------------------- */
  
  // 認証ローディング中の表示（タイムアウト機能付き）
  if (authLoading) {
    return (
      <>
        <ScrollingBackground />
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600 mb-2">認証状態を確認中...</p>
            <p className="text-xs text-gray-500">しばらくお待ちください</p>
            
            {authTimeout && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 mb-2">認証の確認に時間がかかっています</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  ページを再読み込み
                </button>
              </div>
            )}
            
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* スクロール背景 */}
      <ScrollingBackground />
      
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
        
        /* 入力欄のフォーカス色を控えめに適用 */
        input:focus {
          border-color: #16A34A !important;
          box-shadow: 0 0 0 1px rgba(22, 163, 74, 0.15) !important;
          outline: none !important;
        }
        
        /* スマホでの文字はみ出し防止 */
        input {
          font-size: 14px !important;
          line-height: 1.4 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        
        @media (max-width: 768px) {
          input {
            font-size: 16px !important; /* iOSでズームを防ぐ */
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        {/* 背景オーバーレイ - クリックでトップページに戻る */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
          onClick={() => router.push('/')}
        ></div>
        
        <div className="w-full max-w-2xl animate-fade-in-up relative z-20">
          {/* ログインフォーム */}
          <Card 
            className="border-0 shadow-2xl bg-white aspect-video md:aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col md:flex-row">
              {/* 左側：ロゴエリア（3割） */}
              <div className="w-full md:w-3/10 bg-white p-4 md:p-8 flex items-center justify-center">
                <img
                  src="/image/clover.svg"
                  alt="Clover Logo"
                  className="w-24 h-24 md:w-32 md:h-32 text-green-600"
                />
              </div>
              
              {/* 右側：入力フォーム（7割） */}
              <div className="w-full md:w-7/10 p-4 md:p-6 flex flex-col justify-center">
                <div className="text-center mb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1">ログイン</CardTitle>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* エラーメッセージ */}
                  {error && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}
                  
                  {/* ユーザーID */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-500" />
                        ユーザーID
                      </label>
                      <span className="text-xs text-gray-500">職員IDを入力してください</span>
                    </div>
                    <div className="relative">
                      <Input
                        type="text"
                        name="staff_id"
                        value={formData.staff_id}
                        onChange={handleInputChange}
                        className="h-10 pl-3 pr-3 border-2 border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600/10 transition-all duration-200 text-sm md:text-base text-xs"
                        placeholder="例: 12345"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* パスワード */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                        <Lock className="h-3 w-3 text-gray-500" />
                        パスワード
                      </label>
                      <span className="text-xs text-gray-500">設定されたパスワードを入力してください</span>
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="h-10 pl-3 pr-10 border-2 border-gray-200 focus:border-green-600 focus:ring-1 focus:ring-green-600/10 transition-all duration-200 text-sm md:text-base text-xs"
                        placeholder="パスワードを入力"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  

                  {/* パスワードリセットリンク */}
                  <div className="text-right mt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowResetForm(!showResetForm)}
                      className="text-gray-600 hover:text-gray-900 text-xs font-medium p-0 h-auto"
                    >
                      パスワードをお忘れですか？
                    </Button>
                  </div>

                  {/* ログインボタン */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-10 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                        認証中...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        ログイン
                      </div>
                    )}
                  </Button>
                </form>

                {/* パスワードリセットメッセージ */}
                {showResetForm && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border animate-fade-in-up">
                    <h3 className="text-xs font-medium text-gray-900 mb-2">パスワードリセット</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      パスワードを忘れた場合は、システム管理者にお問い合わせください。
                    </p>
                    {resetMessage && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-xs text-blue-700">{resetMessage}</p>
                      </div>
                    )}
                  </div>
                )}

                                 {/* フッター */}
                 <div className="text-center mt-4">
                   <p className="text-xs text-gray-500">© 2025 医療法人 生和会 SDX研究所</p>
                 </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}