'use client';
import React, { useMemo, useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OPTIONS } from './data';
import { Option } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchPalette from './components/SearchPalette';
import CategoryFilter from './components/CategoryFilter';
import LayoutSwitcher, { LayoutType } from './components/LayoutSwitcher';
import GridLayout, { SkeletonCard } from './components/GridLayout';
import ListLayout from './components/ListLayout';
import HospitalNews from './components/HospitalNews';
import { useAuth } from '../../contexts/AuthContext'; // ← 先ほどの新API版を使用（me/isAdmin/currentHospitalId）
import { AnimatePresence } from 'framer-motion';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import AnnouncementPopup from '@/components/AnnouncementPopup';
import { Announcement } from '@/types/announcement';

export default function DepartmentSelection() {
  const router = useRouter();
  // 🆕 新Authコンテキストに適応
  const { user: me, isLoading, profile } = useAuth();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [currentLayout, setCurrentLayout] = useState<LayoutType>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('すべて');

  // アナウンス関連の状態
  const {
    announcements,
    getPopupAnnouncements,
    incrementPopupDisplayCount,
    loading: announcementsLoading,
  } = useAnnouncements();
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);
  const [popupAnnouncements, setPopupAnnouncements] = useState<Announcement[]>([]);
  const [announcementPopupChecked, setAnnouncementPopupChecked] = useState(false);

  // 🆕 権限に基づいてオプションをフィルタリング（roles.code ベース）
  const filteredOptions = useMemo(() => {
    if (isLoading || !me) return OPTIONS;
    const isAdmin = profile?.role === 'admin';
    return isAdmin ? OPTIONS : OPTIONS.filter((option) => option.department !== '管理');
  }, [me, isLoading, profile]);

  // カテゴリフィルタリング
  const categoryFilteredOptions = useMemo(() => {
    if (selectedCategory === 'すべて') return filteredOptions;
    return filteredOptions.filter((option) => option.department === selectedCategory);
  }, [filteredOptions, selectedCategory]);

  // カテゴリ一覧とカウント
  const categories = useMemo(() => {
    const deps = [...new Set(filteredOptions.map((option) => option.department))];
    return ['すべて', ...deps];
  }, [filteredOptions]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { すべて: filteredOptions.length };
    filteredOptions.forEach((option) => {
      counts[option.department] = (counts[option.department] || 0) + 1;
    });
    return counts;
  }, [filteredOptions]);

  const selectedLabel = useMemo(
    () => categoryFilteredOptions.find((o) => o.id === selectedId)?.label ?? null,
    [selectedId, categoryFilteredOptions]
  );

  // 🆕 初期カテゴリをスタッフの部署に寄せる（DB調整中はスキップ）
  useEffect(() => {
    if (!isLoading && me && selectedCategory === 'すべて') {
      const dept = profile?.department;
      if (dept && categories.includes(dept)) setSelectedCategory(dept);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, me, categories, profile?.department]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // デバッグ用：localStorage クリア機能
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as { clearAnnouncementStorage?: () => void }).clearAnnouncementStorage = () => {
        localStorage.removeItem('closedAnnouncements');
        localStorage.removeItem('announcements');
        console.log('Announcement storage cleared. Please refresh to see popups again.');
      };
      (window as { showAnnouncementStorage?: () => void }).showAnnouncementStorage = () => {
        const closedAnnouncements = localStorage.getItem('closedAnnouncements');
        const storedAnnouncements = localStorage.getItem('announcements');
        console.log('Closed announcements:', closedAnnouncements ? JSON.parse(closedAnnouncements) : []);
        console.log('Announcements in storage:', storedAnnouncements ? JSON.parse(storedAnnouncements).length : 0);
      };
    }
  }, []);

  // ページロード時にポップアップチェックをリセット
  useEffect(() => {
    setAnnouncementPopupChecked(false);
  }, []);

  // 🆕 アナウンスポップアップ表示のチェック（user_metadata 依存を廃止）
  useEffect(() => {
    // 参照部門：profile.department（なければ空文字で全体向けを拾う想定）
    const userDepartment = profile?.department ?? '';

    if (me && !announcementPopupChecked && !announcementsLoading && announcements.length > 0) {
      try {
        const popupTargetAnnouncements = getPopupAnnouncements(userDepartment);

        if (popupTargetAnnouncements.length > 0) {
          // localStorage から閉じたアナウンスをチェック
          const closedAnnouncementsJson = localStorage.getItem('closedAnnouncements');
          const closedAnnouncements = closedAnnouncementsJson ? JSON.parse(closedAnnouncementsJson) : [];

          // 閉じていないアナウンスのみフィルタ
          const unviewedAnnouncements = popupTargetAnnouncements.filter(
            (announcement) => !closedAnnouncements.includes(announcement.id)
          );

          if (unviewedAnnouncements.length > 0) {
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
  }, [me, profile?.department, announcementPopupChecked, announcementsLoading, announcements.length, getPopupAnnouncements]);

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

        // 現在のポップアップのアナウンスIDを追加（重複排除）
        const newClosedAnnouncements = [...closedAnnouncements, ...popupAnnouncements.map((a) => a.id)];
        const uniqueClosedAnnouncements = [...new Set(newClosedAnnouncements)];
        localStorage.setItem('closedAnnouncements', JSON.stringify(uniqueClosedAnnouncements));

        // 表示回数をカウントアップ
        popupAnnouncements.forEach((announcement) => {
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

  // サイドバートグル処理
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // スケルトンカードの配列を生成
  const skeletonCards = Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex">
      {/* サイドバー */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSidebarToggle={handleSidebarToggle}
      />

      {/* メインコンテンツ */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        {/* ヘッダー */}
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onSearchClick={() => setSearchPaletteOpen(true)}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={handleSidebarToggle}
        />

        {/* メインコンテンツエリア */}
        <main className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <p className="sr-only" role="status" aria-live="polite">
              {isPending && selectedLabel ? `${selectedLabel} に移動中…` : '項目を選択してください'}
            </p>

            {/* 病院ニュース - 上部に配置 */}
            <div className="mb-6">
              <HospitalNews />
            </div>

            {/* 機能選択エリア */}
            <section id="services" aria-label="利用できる項目" className="relative bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">サービス一覧</h2>
              </div>

              {/* 部署選択と表示形式コントロール */}
              <div className="flex flex-col gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {/* 部署選択 */}
                <div className="w-full">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">部署選択</h3>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    counts={categoryCounts}
                  />
                </div>

                {/* 表示形式選択 */}
                <div className="w-full">
                  <h3 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">表示形式</h3>
                  <LayoutSwitcher currentLayout={currentLayout} onLayoutChange={setCurrentLayout} />
                </div>
              </div>

              {/* ローディング中のスケルトン表示 */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                  {skeletonCards}
                </div>
              ) : (
                <>
                  {currentLayout === 'grid' && (
                    <GridLayout
                      options={categoryFilteredOptions}
                      selectedId={selectedId}
                      isPending={isPending}
                      onNavigate={handleNavigate}
                    />
                  )}

                  {currentLayout === 'list' && (
                    <ListLayout
                      options={categoryFilteredOptions}
                      selectedId={selectedId}
                      isPending={isPending}
                      onNavigate={handleNavigate}
                    />
                  )}
                </>
              )}
            </section>

            {/* フッター */}
            <footer className="mt-16 text-center text-xs text-gray-500 dark:text-neutral-400">
              © 2025 Koreha Maenaka ga tukutta. www.
            </footer>
          </div>
        </main>
      </div>

      {/* 検索パレット */}
      <SearchPalette
        options={filteredOptions}
        onSelect={handleNavigate}
        isOpen={searchPaletteOpen}
        onClose={() => setSearchPaletteOpen(false)}
      />

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
          .hover\\:-translate-y-\\[2px\\]:hover {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
