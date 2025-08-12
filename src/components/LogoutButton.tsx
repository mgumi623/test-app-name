'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const { signOut, userData } = useAuth();

  if (!userData) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-muted-foreground">
        {userData.name && <span>{userData.name}</span>}
        {userData.job && <span className="ml-2 text-xs">({userData.job})</span>}
        {userData.role && <span className="ml-2 px-2 py-1 bg-secondary rounded-md text-xs">{userData.role}</span>}
      </div>
      <Button
        onClick={signOut}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        ログアウト
      </Button>
    </div>
  );
}