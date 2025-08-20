'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Header() {
  const { profile } = useAuth();

  return (
    <header className="mb-8 sm:mb-12">
      {/* ログアウトボタン */}
      <div className="flex justify-end mb-4">
        <LogoutButton />
      </div>
      
      {/* メインヘッダー */}
      <div className="text-center">
        <Avatar className="w-16 h-16 mx-auto shadow">
          <AvatarFallback className="bg-white border border-border">
            <Image src="/image/clover.svg" alt="Clover Logo" width={32} height={32} />
          </AvatarFallback>
        </Avatar>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          こんにちは {profile?.name || 'ユーザー'}さん
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          利用する機能を選択してください。
        </p>
      </div>
    </header>
  );
}