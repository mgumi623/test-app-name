'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export default function LogoutButton() {
  const { signOut, profile, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ユーザーが認証されていない場合のみnullを返す
  if (!user) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('Logout button clicked');
      await signOut();
    } catch (error) {
      console.error('Error in logout handler:', error);
      // エラーが発生してもログアウト処理を続行
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm text-muted-foreground">
        {profile ? (
          [profile.hospital, profile.department, profile.position]
            .filter(Boolean)
            .map((item, index, array) => (
              <span key={index}>
                {item}
                {index < array.length - 1 && <span className="mx-2 text-gray-300">|</span>}
              </span>
            ))
        ) : (
          <span>ユーザー情報取得中...</span>
        )}
      </div>
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-colors disabled:opacity-50"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
      </Button>
    </div>
  );
}