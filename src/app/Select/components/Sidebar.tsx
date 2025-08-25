'use client';

import React from 'react';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Bell, 
  BarChart3, 
  HelpCircle, 
  Info, 
  FileText, 
  Mail,
  LogOut,
  PanelLeftClose
} from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSidebarToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onClose, onSidebarToggle }: SidebarProps) {
  const { user, profile } = useAuth();

  const navigationItems = [
    { icon: Home, label: 'サービス一覧', href: '#services' },
    { icon: MessageSquare, label: 'AIチャット', href: '/AIchat' },
    { icon: Calendar, label: 'スケジュール', href: '/schedule/riha' },
    { icon: Bell, label: 'お知らせ', href: '/announcements' },
  ];

  const helpItems = [
    { icon: HelpCircle, label: 'S-BOTとは', href: '/help/about' },
    { icon: Info, label: 'できること', href: '/help/features' },
    { icon: FileText, label: 'FAQ', href: '/help/faq' },
    { icon: Mail, label: 'お問い合わせ', href: '/help/contact' },
  ];

  const adminItems = [
    { icon: BarChart3, label: '管理分析', href: '/admin/analytics' },
  ];

  const isAdmin = user?.email?.endsWith('@admin.com') || profile?.position === '管理職';
  
  // デバッグ用: 権限情報をログ出力
  console.log('[Sidebar] Permission check:', {
    profilePosition: profile?.position,
    isAdmin,
    userEmail: user?.email
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-[#e8f5e8] border-r border-gray-200 dark:border-neutral-700 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:fixed lg:z-40
        w-64 lg:w-72
      `}>
        
        {/* Header with Light Green Gradient - Height matched to main header */}
        <div className="bg-[#e8f5e8] border-b border-green-200 dark:border-green-700/30 px-4 py-3 lg:px-6 h-[60px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/image/clover.svg"
              alt="Clover"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <Image
              src="/logoimage/s-bot-logo.png"
              alt="S-BOT Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          
          {/* Sidebar Toggle Button - Only visible when sidebar is open */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onSidebarToggle}
            className="h-8 w-8 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/30"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation with organized sections */}
        <nav className="flex-1 overflow-y-auto">
          {/* Main Menu Section */}
          <div className="p-4 pb-2">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 px-2 border-b border-gray-200 dark:border-neutral-600 pb-2">
              メインメニュー
            </h3>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (item.href.startsWith('#')) {
                        e.preventDefault();
                        const element = document.getElementById(item.href.substring(1));
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }
                    }}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-all duration-200 hover:shadow-sm"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Admin Navigation Section */}
          {isAdmin && (
            <div className="px-4 pb-2">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 px-2 border-b border-gray-200 dark:border-neutral-600 pb-2">
                管理機能
              </h3>
              <div className="space-y-2">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-all duration-200 hover:shadow-sm"
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Help & Support Section */}
          <div className="px-4 pb-2">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4 px-2 border-b border-gray-200 dark:border-neutral-600 pb-2">
              サポート
            </h3>
            <div className="space-y-2">
              {helpItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-3 text-base font-medium text-gray-800 dark:text-gray-200 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-400 transition-all duration-200 hover:shadow-sm"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
