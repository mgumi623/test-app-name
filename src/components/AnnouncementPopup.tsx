'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, User, ChevronLeft, ChevronRight, AlertTriangle, Info, Bell } from 'lucide-react';
import { Announcement, ANNOUNCEMENT_PRIORITIES } from '@/types/announcement';

interface AnnouncementPopupProps {
  announcements: Announcement[];
  onClose: () => void;
  onAnnouncementViewed?: (announcementId: string) => void;
}

export default function AnnouncementPopup({ 
  announcements, 
  onClose, 
  onAnnouncementViewed 
}: AnnouncementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewedAnnouncements, setViewedAnnouncements] = useState<Set<string>>(new Set());

  const currentAnnouncement = announcements[currentIndex];

  // 現在のアナウンスを表示済みとしてマーク
  useEffect(() => {
    if (currentAnnouncement && !viewedAnnouncements.has(currentAnnouncement.id)) {
      setViewedAnnouncements(prev => new Set([...prev, currentAnnouncement.id]));
      onAnnouncementViewed?.(currentAnnouncement.id);
    }
  }, [currentAnnouncement, viewedAnnouncements, onAnnouncementViewed]);

  const handleNext = () => {
    if (currentIndex < announcements.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityConfig = (priority: string) => {
    const config = ANNOUNCEMENT_PRIORITIES.find(p => p.value === priority);
    return config || ANNOUNCEMENT_PRIORITIES[1]; // デフォルトは 'normal'
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4" />;
      case 'high':
        return <Bell className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  if (!currentAnnouncement) return null;

  const priorityConfig = getPriorityConfig(currentAnnouncement.priority);

  return (
    <motion.div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackgroundClick}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        <Card className="relative shadow-2xl">
          <CardHeader className="pr-12 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge 
                  variant={currentAnnouncement.priority === 'urgent' ? 'destructive' : 'default'}
                  className={`${priorityConfig.color} ${currentAnnouncement.priority === 'urgent' ? 'animate-pulse' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(currentAnnouncement.priority)}
                    {priorityConfig.label}
                  </div>
                </Badge>
                <Badge variant="secondary">
                  {currentAnnouncement.category}
                </Badge>
                {currentAnnouncement.targetDepartments.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    対象: {currentAnnouncement.targetDepartments.join(', ')}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseClick}
                className="absolute top-4 right-4 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <CardTitle className="text-xl leading-tight pr-8">
              {currentAnnouncement.title}
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {currentAnnouncement.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(currentAnnouncement.createdAt)}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {currentAnnouncement.content}
              </div>
            </div>
            
            {/* 表示期間の情報 */}
            <div className="p-3 bg-muted rounded-md text-sm space-y-1">
              <div className="font-medium">表示期間</div>
              <div className="text-muted-foreground">
                {formatDate(currentAnnouncement.displayStartDate)} ～ {formatDate(currentAnnouncement.displayEndDate)}
              </div>
            </div>

            {/* ポップアップ表示回数の情報 */}
            {currentAnnouncement.maxPopupDisplays && (
              <div className="text-xs text-muted-foreground">
                ポップアップ表示: {(currentAnnouncement.popupDisplayCount || 0) + 1} / {currentAnnouncement.maxPopupDisplays} 回
              </div>
            )}
            
            {/* ナビゲーションとアクション */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                {announcements.length > 1 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      disabled={currentIndex === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      前へ
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentIndex + 1} / {announcements.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNext}
                      disabled={currentIndex === announcements.length - 1}
                    >
                      次へ
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                {announcements.length > 1 && currentIndex < announcements.length - 1 ? (
                  <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                    次のお知らせを見る
                  </Button>
                ) : (
                  <Button onClick={handleCloseClick} className="bg-green-600 hover:bg-green-700">
                    了解しました
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}