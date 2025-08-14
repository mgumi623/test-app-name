'use client';

import { useEffect } from 'react';
import { Loading } from '@/components/ui/loading';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const publicRoutes = ['/', '/login', '/posts'];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      if (!user && !isPublicRoute) {
        // ログインしていない状態で保護されたページにアクセスした場合
        router.push('/login');
        return;
      }
      
      if (user && pathname === '/login') {
        // ログイン済みでログインページにアクセスした場合
        router.push('/Select');
        return;
      }
    }
  }, [user, loading, pathname, router]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loading size="sm" />
          <p className="text-muted-foreground">読み込み中...</p>
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