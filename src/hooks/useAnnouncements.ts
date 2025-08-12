'use client';

import { useState, useEffect, useCallback } from 'react';
import { Announcement, AnnouncementFormData } from '@/types/announcement';

// サンプルデータ
const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'システムメンテナンスのお知らせ',
    content: '8月15日（木）2:00～4:00にシステムメンテナンスを実施します。期間中はシステムをご利用いただけません。',
    category: 'システムメンテナンス',
    priority: 'high',
    author: '情報システム部',
    createdAt: new Date('2025-08-10T10:00:00'),
    updatedAt: new Date('2025-08-10T10:00:00'),
    displayStartDate: new Date('2025-08-10T00:00:00'),
    displayEndDate: new Date('2025-12-31T23:59:59'),
    targetDepartments: ['全部署'],
    isActive: true,
    hasPopup: true,
    popupDisplayCount: 0,
    maxPopupDisplays: 1
  },
  {
    id: '2',
    title: 'インフルエンザ予防接種のご案内',
    content: '10月1日～11月30日まで予防接種を実施します。健康管理室（本館2階）にて予約受付中です。',
    category: '健康管理',
    priority: 'normal',
    author: '健康管理室',
    createdAt: new Date('2025-09-15T09:00:00'),
    updatedAt: new Date('2025-09-15T09:00:00'),
    displayStartDate: new Date('2025-09-15T00:00:00'),
    displayEndDate: new Date('2025-12-31T23:59:59'),
    targetDepartments: ['全部署'],
    isActive: true,
    hasPopup: true,
    popupDisplayCount: 0,
    maxPopupDisplays: 1
  },
  {
    id: '3',
    title: '【緊急】感染対策の強化について',
    content: '感染拡大を受け、マスク着用と手指消毒を徹底してください。体調不良時は速やかに報告をお願いします。',
    category: '重要なお知らせ',
    priority: 'urgent',
    author: '感染対策室',
    createdAt: new Date('2025-08-12T08:00:00'),
    updatedAt: new Date('2025-08-12T08:00:00'),
    displayStartDate: new Date('2025-08-12T00:00:00'),
    displayEndDate: new Date('2025-12-31T23:59:59'),
    targetDepartments: ['全部署'],
    isActive: true,
    hasPopup: true,
    popupDisplayCount: 0,
    maxPopupDisplays: 1
  }
];

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // データの初期化
  useEffect(() => {
    const loadAnnouncements = () => {
      try {
        const stored = localStorage.getItem('announcements');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Date オブジェクトに変換
          const converted = parsed.map((announcement: any) => ({
            ...announcement,
            createdAt: new Date(announcement.createdAt),
            updatedAt: new Date(announcement.updatedAt),
            displayStartDate: new Date(announcement.displayStartDate),
            displayEndDate: new Date(announcement.displayEndDate)
          }));
          console.log('Loaded announcements from storage:', converted.length);
          setAnnouncements(converted);
        } else {
          // 初回アクセス時はサンプルデータを使用
          console.log('Loading sample announcements:', sampleAnnouncements.length);
          setAnnouncements(sampleAnnouncements);
          localStorage.setItem('announcements', JSON.stringify(sampleAnnouncements));
        }
      } catch (error) {
        console.error('Failed to load announcements:', error);
        console.log('Falling back to sample announcements');
        setAnnouncements(sampleAnnouncements);
      } finally {
        setLoading(false);
      }
    };

    // すぐに読み込みを開始
    setTimeout(loadAnnouncements, 0);
  }, []);

  // データの保存
  const saveToStorage = useCallback((data: Announcement[]) => {
    try {
      localStorage.setItem('announcements', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save announcements:', error);
    }
  }, []);

  // アクティブなアナウンス取得
  const getActiveAnnouncements = useCallback((targetDepartment?: string) => {
    const now = new Date();
    return announcements.filter(announcement => {
      const isTimeValid = now >= announcement.displayStartDate && now <= announcement.displayEndDate;
      const isActive = announcement.isActive;
      const isDepartmentMatch = !targetDepartment || 
        announcement.targetDepartments.includes('全部署') || 
        announcement.targetDepartments.includes(targetDepartment);
      
      return isTimeValid && isActive && isDepartmentMatch;
    });
  }, [announcements]);

  // ポップアップ対象のアナウンス取得
  const getPopupAnnouncements = useCallback((targetDepartment?: string) => {
    console.log('Getting popup announcements for department:', targetDepartment);
    const activeAnnouncements = getActiveAnnouncements(targetDepartment);
    console.log('Active announcements:', activeAnnouncements.length);
    
    const popupAnnouncements = activeAnnouncements.filter(announcement => {
      console.log(`Checking announcement ${announcement.id}:`, {
        hasPopup: announcement.hasPopup,
        maxDisplays: announcement.maxPopupDisplays,
        currentCount: announcement.popupDisplayCount || 0
      });
      
      if (!announcement.hasPopup) return false;
      if (!announcement.maxPopupDisplays) return true;
      return (announcement.popupDisplayCount || 0) < announcement.maxPopupDisplays;
    });
    
    console.log('Filtered popup announcements:', popupAnnouncements.length);
    return popupAnnouncements;
  }, [getActiveAnnouncements]);

  // アナウンス追加
  const addAnnouncement = useCallback((formData: AnnouncementFormData) => {
    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      ...formData,
      author: 'システム管理者', // 実際の実装では認証されたユーザー情報を使用
      createdAt: new Date(),
      updatedAt: new Date(),
      displayStartDate: new Date(formData.displayStartDate),
      displayEndDate: new Date(formData.displayEndDate),
      isActive: true,
      popupDisplayCount: 0
    };

    const updated = [...announcements, newAnnouncement];
    setAnnouncements(updated);
    saveToStorage(updated);
    
    return newAnnouncement;
  }, [announcements, saveToStorage]);

  // アナウンス更新
  const updateAnnouncement = useCallback((id: string, formData: AnnouncementFormData) => {
    const updated = announcements.map(announcement => {
      if (announcement.id === id) {
        return {
          ...announcement,
          ...formData,
          displayStartDate: new Date(formData.displayStartDate),
          displayEndDate: new Date(formData.displayEndDate),
          updatedAt: new Date()
        };
      }
      return announcement;
    });

    setAnnouncements(updated);
    saveToStorage(updated);
    
    const updatedAnnouncement = updated.find(a => a.id === id);
    return updatedAnnouncement || null;
  }, [announcements, saveToStorage]);

  // アナウンス削除
  const deleteAnnouncement = useCallback((id: string) => {
    const updated = announcements.filter(announcement => announcement.id !== id);
    setAnnouncements(updated);
    saveToStorage(updated);
  }, [announcements, saveToStorage]);

  // アナウンスの有効/無効切り替え
  const toggleAnnouncementActive = useCallback((id: string) => {
    const updated = announcements.map(announcement => {
      if (announcement.id === id) {
        return {
          ...announcement,
          isActive: !announcement.isActive,
          updatedAt: new Date()
        };
      }
      return announcement;
    });

    setAnnouncements(updated);
    saveToStorage(updated);
  }, [announcements, saveToStorage]);

  // ポップアップ表示回数を増加
  const incrementPopupDisplayCount = useCallback((id: string) => {
    const updated = announcements.map(announcement => {
      if (announcement.id === id) {
        return {
          ...announcement,
          popupDisplayCount: (announcement.popupDisplayCount || 0) + 1,
          updatedAt: new Date()
        };
      }
      return announcement;
    });

    setAnnouncements(updated);
    saveToStorage(updated);
  }, [announcements, saveToStorage]);

  return {
    announcements,
    loading,
    getActiveAnnouncements,
    getPopupAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementActive,
    incrementPopupDisplayCount
  };
}