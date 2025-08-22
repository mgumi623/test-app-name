/**
 * このファイルは認証に基づくルート保護を提供するコンポーネントです。
 * 
 * 主な機能：
 * - 認証状態に応じたアクセス制御
 * - パブリックルートの許可（'/', '/login', '/posts'）
 * - 未認証ユーザーのリダイレクト
 * - ログイン済みユーザーの適切なルーティング
 * 
 * 動作：
 * - 非認証ユーザーが保護ページにアクセス → ログインページへリダイレクト
 * - ログイン済みユーザーがログインページにアクセス → 選択ページへリダイレクト
 * - ローディング中は専用のUI表示
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Loading } from '@/components/ui/loading';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const publicRoutes = ['/', '/login', '/posts'];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // デバッグ情報を常に出力
  console.log('[ProtectedRoute] State:', {
    pathname,
    user: user ? 'exists' : 'null',
    isLoading,
    isRedirecting
  });

  // パス変更時にリダイレクト状態をリセット
  useEffect(() => {
    setIsRedirecting(false);
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  }, [pathname]);

  // コンポーネントアンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // ローディング中は専用のUI表示
  if (isLoading) {
    console.log('[ProtectedRoute] Still loading, showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loading size="md" variant="smooth" />
          <p className="text-muted-foreground">認証情報を確認中...</p>
          <p className="text-xs text-muted-foreground">Debug: {pathname}</p>
        </div>
      </div>
    );
  }

  // リダイレクト中はローディング表示
  if (isRedirecting) {
    console.log('[ProtectedRoute] Redirecting, showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loading size="md" variant="smooth" />
          <p className="text-muted-foreground">リダイレクト中...</p>
          <p className="text-xs text-muted-foreground">Debug: {pathname}</p>
        </div>
      </div>
    );
  }

  // パブリックルートの場合は常にアクセス許可
  if (publicRoutes.includes(pathname)) {
    console.log('[ProtectedRoute] Public route, allowing access');
    
    // ログイン済みユーザーがログインページにアクセスした場合はSelectページにリダイレクト
    if (user && pathname === '/login') {
      console.log('[ProtectedRoute] Logged in user on login page, redirecting to Select');
      setIsRedirecting(true);
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/Select');
      }, 100);
      return (
        <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loading size="md" variant="smooth" />
            <p className="text-muted-foreground">リダイレクト中...</p>
            <p className="text-xs text-muted-foreground">Debug: {pathname}</p>
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  }

  // 保護されたルートの場合
  if (!user) {
    console.log('[ProtectedRoute] Protected route, no user, redirecting to login');
    setIsRedirecting(true);
    redirectTimeoutRef.current = setTimeout(() => {
      router.push('/login');
    }, 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loading size="md" variant="smooth" />
          <p className="text-muted-foreground">リダイレクト中...</p>
          <p className="text-xs text-muted-foreground">Debug: {pathname}</p>
        </div>
      </div>
    );
  }

  // 認証済みユーザーで保護されたルートの場合
  console.log('[ProtectedRoute] Protected route, authenticated user, allowing access');
  return <>{children}</>;
}