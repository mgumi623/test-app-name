'use client';

import React from 'react';
import Image from 'next/image';
import { Menu, Bell, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  onSearchClick?: () => void;
  sidebarOpen?: boolean;
  onSidebarToggle?: () => void;
}

export default function Header({ onMenuClick, onSearchClick, sidebarOpen = false, onSidebarToggle }: HeaderProps) {
  const { user, profile, isLoading } = useAuth();
  const permission = user?.user_metadata?.permission as string | undefined;

  // デバッグ情報を出力
  console.log('[Header] Auth state:', {
    user: user ? 'exists' : 'null',
    profile: profile ? 'exists' : 'null',
    isLoading,
    userName: profile?.name,
    userEmail: user?.email,
    department: profile?.department,
    role: profile?.role,
    position: profile?.position
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm h-[60px] flex items-center">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 w-full">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {/* Desktop Hamburger Menu - Only visible when sidebar is closed */}
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onSidebarToggle}
              className="hidden lg:flex h-9 w-9"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          {/* Logo - Hidden when sidebar is open on desktop */}
          <div className={`transition-opacity duration-200 ${sidebarOpen ? 'lg:opacity-0 lg:pointer-events-none' : 'lg:opacity-100'}`}>
            <Image
              src="/image/clover.svg"
              alt="Clover Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <Button
            onClick={onSearchClick}
            variant="outline"
            className="w-full justify-start text-left text-gray-500 bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            機能名、部署、タグで検索...
            <div className="ml-auto flex items-center gap-1 text-xs text-gray-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* User Info */}
          <div className="hidden sm:flex items-center gap-3">
            {isLoading ? (
              <div className="flex flex-col text-xs text-right">
                <span className="font-medium text-gray-900">読み込み中...</span>
                <span className="text-gray-500">認証情報を確認中</span>
              </div>
            ) : user ? (
              <div className="flex flex-col text-xs text-right">
                <span className="font-medium text-gray-900">
                  {profile?.name || 'ユーザー'}
                </span>
                <div className="flex items-center gap-2 text-gray-500 justify-end">
                  <span>{profile?.hospital || '病院名未設定'}</span>
                  {profile?.position && (
                    <>
                      <span>/</span>
                      <span className="text-gray-400">{profile.position}</span>
                    </>
                  )}
                  {profile?.profession && (
                    <>
                      <span>/</span>
                      <span className="text-gray-400">{profile.profession}</span>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col text-xs text-right">
                <span className="font-medium text-gray-900">未ログイン</span>
                <span className="text-gray-500">ログインしてください</span>
              </div>
            )}
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-green-700">
                {profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>

          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
}