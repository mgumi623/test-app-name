'use client';
import React, { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { OPTIONS } from './data';
import { Option } from './types';
import Header from './components/Header';
import HospitalNews from './components/HospitalNews';
import LayoutSwitcher, { LayoutType } from './components/LayoutSwitcher';
import GridLayout from './components/GridLayout';
import AccordionLayout from './components/AccordionLayout';
import ListLayout from './components/ListLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import { Announcement } from '@/types/announcement';

export default function DepartmentSelection() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('accordion');
  
  // アナウンス関連の状態
  const { announcements, getPopupAnnouncements, incrementPopupDisplayCount, loading: announcementsLoading } = useAnnouncements();
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  const [popupAnnouncements, setPopupAnnouncements] = useState<Announcement[]>([]);
  const [announcementPopupChecked, setAnnouncementPopupChecked] = useState(false);

  // 権限に基づいてオプションをフィルタリング
  const filteredOptions = useMemo(() => {
    const userPermission = user?.user_metadata?.permission as string;
    
    // 研究員または管理職の場合は全てのオプションを表示
    if (userPermission === '研究員' || userPermission === '管理職') {
      return OPTIONS;
    }
    
    // それ以外の場合は管理部門のオプションを除外
    return OPTIONS.filter(option => option.department !== '管理');
  }, [user]);

  const selectedLabel = useMemo(
    () => filteredOptions.find((o) => o.id === selectedId)?.label ?? null,
    [selectedId, filteredOptions]
  );

  // デバッグ用：localStorage クリア機能
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).clearAnnouncementStorage = () => {
        localStorage.removeItem('closedAnnouncements');
        localStorage.removeItem('announcements');
        console.log('Announcement storage cleared. Please refresh to see popups again.');
      };
      (window as any).showAnnouncementStorage = () => {
        const closedAnnouncements = localStorage.getItem('closedAnnouncements');
        const storedAnnouncements = localStorage.getItem('announcements');
        console.log('Closed announcements:', closedAnnouncements ? JSON.parse(closedAnnouncements) : []);
        console.log('Announcements in storage:', storedAnnouncements ? JSON.parse(storedAnnouncements).length : 0);
      };
    }
  }, []);

  // アナウンスポップアップ表示のチェック
  useEffect(() => {
    if (user && !announcementPopupChecked && !announcementsLoading && announcements.length > 0) {
      try {
        const userDepartment = user.user_metadata?.department as string;
        console.log('User department:', userDepartment);
        console.log('Available announcements:', announcements.length);
        
        const popupTargetAnnouncements = getPopupAnnouncements(userDepartment);
        console.log('Popup target announcements:', popupTargetAnnouncements.length);
        
        if (popupTargetAnnouncements.length > 0) {
          // localStorage から閉じた アナウンスをチェック
          const closedAnnouncementsJson = localStorage.getItem('closedAnnouncements');
          const closedAnnouncements = closedAnnouncementsJson ? JSON.parse(closedAnnouncementsJson) : [];
          console.log('Closed announcements:', closedAnnouncements);
          
          // 閉じていないアナウンスのみフィルタ
          const unviewedAnnouncements = popupTargetAnnouncements.filter(
            announcement => !closedAnnouncements.includes(announcement.id)
          );
          console.log('Unviewed announcements:', unviewedAnnouncements.length);
          
          if (unviewedAnnouncements.length > 0) {
            console.log('Setting popup announcements:', unviewedAnnouncements);
            setPopupAnnouncements(unviewedAnnouncements);
            setShowAnnouncementPopup(true);
          }
        }
        setAnnouncementPopupChecked(true);
      } catch (error) {
        console.error('Error getting popup announcements:', error);
        setAnnouncementPopupChecked(true);
      }
    }
  }, [user, announcementPopupChecked, announcementsLoading, announcements.length, getPopupAnnouncements]);

  const handleNavigate = (opt: Option) => {
    if (isPending) return; // 二重押下防止
    setSelectedId(opt.id);
    startTransition(() => {
      router.push(opt.href);
    });
  };

  const handleCloseAnnouncementPopup = () => {
    // 閉じたアナウンスのIDをlocalStorageに保存
    if (popupAnnouncements.length > 0) {
      try {
        const closedAnnouncementsJson = localStorage.getItem('closedAnnouncements');
        const closedAnnouncements = closedAnnouncementsJson ? JSON.parse(closedAnnouncementsJson) : [];
        
        // 現在のポップアップのアナウンスIDを追加
        const newClosedAnnouncements = [...closedAnnouncements, ...popupAnnouncements.map(announcement => announcement.id)];
        const uniqueClosedAnnouncements = [...new Set(newClosedAnnouncements)];
        
        localStorage.setItem('closedAnnouncements', JSON.stringify(uniqueClosedAnnouncements));
        
        // 表示回数をカウントアップ
        popupAnnouncements.forEach(announcement => {
          incrementPopupDisplayCount(announcement.id);
        });
        
      } catch (error) {
        console.error('Error saving closed announcements:', error);
      }
    }
    
    setShowAnnouncementPopup(false);
    setPopupAnnouncements([]);
  };

  const handleAnnouncementViewed = (announcementId: string) => {
    // 個別のアナウンス表示回数をカウントアップ
    incrementPopupDisplayCount(announcementId);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-card to-muted/30 text-foreground">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <Header />

          <p className="sr-only" role="status" aria-live="polite">
            {isPending && selectedLabel ? `${selectedLabel} に移動中…` : '項目を選択してください'}
          </p>

          <LayoutSwitcher 
            currentLayout={currentLayout} 
            onLayoutChange={setCurrentLayout} 
          />

          <section aria-label="利用できる項目" className="relative">
          {currentLayout === 'grid' && (
            <GridLayout
              options={filteredOptions}
              selectedId={selectedId}
              isPending={isPending}
              onNavigate={handleNavigate}
            />
          )}
          
          {currentLayout === 'accordion' && (
            <AccordionLayout
              options={filteredOptions}
              selectedId={selectedId}
              isPending={isPending}
              onNavigate={handleNavigate}
            />
          )}
          
          {currentLayout === 'list' && (
            <ListLayout
              options={filteredOptions}
              selectedId={selectedId}
              isPending={isPending}
              onNavigate={handleNavigate}
            />
          )}
        </section>

          {/* 病院ニュース */}
          <HospitalNews />

          {/* フッター */}
        <footer className="mt-10 sm:mt-14 text-center text-xs text-muted-foreground">
          © 2025 Koreha Maenaka ga tukutta. www.
        </footer>
      </main>

      {/* アナウンスポップアップ */}
      <AnimatePresence>
        {showAnnouncementPopup && popupAnnouncements.length > 0 && (
          <AnnouncementPopup
            announcements={popupAnnouncements}
            onClose={handleCloseAnnouncementPopup}
            onAnnouncementViewed={handleAnnouncementViewed}
          />
        )}
      </AnimatePresence>

      {/* ユーザーの reduce-motion 設定に追従 */}
      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .hover\\:-translate-y-[2px]:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}
