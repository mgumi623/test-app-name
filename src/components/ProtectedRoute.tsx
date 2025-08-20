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

import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!user && !isPublicRoute) {
        // ログインしていない状態で保護されたページにアクセスした場合
        console.log('[ProtectedRoute] No user, redirecting to login');
        router.push('/login');
        return;
      }
      
      if (user && pathname === '/login') {
        // ログイン済みでログインページにアクセスした場合
        console.log('[ProtectedRoute] User logged in, redirecting to Select');
        setTimeout(() => {
          router.push('/Select');
        }, 200);
        return;
      }
    }
  }, [user, isLoading, pathname, router]);

  // ローディング中の表示
  // 初期ローディング状態でパブリックルートの場合は直接表示
  if (isLoading) {
    const isPublicRoute = publicRoutes.includes(pathname);
    if (isPublicRoute) {
      return <>{children}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loading size="md" variant="smooth" />
          <p className="text-muted-foreground">認証情報を確認中...</p>
        </div>
      </div>
    );
  }

  // 公開ルートまたはログイン済みの場合のみ表示
  const isPublicRoute = publicRoutes.includes(pathname);
  if (isPublicRoute || user) {
    return <>{children}</>;
  }

  // 認証が必要だが未ログインの場合は何も表示しない
  return null;
}