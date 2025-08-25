'use client';

import React, { useState, useMemo } from 'react';
import { Loading } from '@/components/ui/loading';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  User, 
  Search, 
  Filter, 
  Bell, 
  AlertTriangle, 
  Info, 
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { Announcement, ANNOUNCEMENT_CATEGORIES, ANNOUNCEMENT_PRIORITIES } from '@/types/announcement';
import AnnouncementForm from './components/AnnouncementForm';

export default function AnnouncementsPage() {
  const { 
    announcements, 
    loading, 
    deleteAnnouncement, 
    toggleAnnouncementActive 
  } = useAnnouncements();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ユーザーの部署と権限取得
  const userDepartment = user?.email?.split('@')[0] || null;
  const userPermission = user?.email?.endsWith('@admin.com') ? '管理職' : '一般';
  const isAdmin = userPermission === '管理職';

  // フィルタリングされたアナウンス
  const filteredAnnouncements = useMemo(() => {
    const filtered = announcements.filter(announcement => {
      // 管理者以外は自分の部署のアナウンスのみ表示
      if (!isAdmin) {
        const isDepartmentMatch = 
          announcement.targetDepartments.includes('全部署') || 
          announcement.targetDepartments.includes(userDepartment) ||
          !userDepartment;
        if (!isDepartmentMatch) return false;
      }

      // アクティブフィルタ
      if (showActiveOnly) {
        const now = new Date();
        const isActive = announcement.isActive && 
          now >= announcement.displayStartDate && 
          now <= announcement.displayEndDate;
        if (!isActive) return false;
      }

      // 検索フィルタ
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTitle = announcement.title.toLowerCase().includes(searchLower);
        const matchesContent = announcement.content.toLowerCase().includes(searchLower);
        const matchesAuthor = announcement.author.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesContent && !matchesAuthor) return false;
      }

      // カテゴリフィルタ
      if (selectedCategory !== 'all' && announcement.category !== selectedCategory) {
        return false;
      }

      // 優先度フィルタ
      if (selectedPriority !== 'all' && announcement.priority !== selectedPriority) {
        return false;
      }

      return true;
    });

    // 優先度と日付でソート
    return filtered.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [announcements, userDepartment, isAdmin, showActiveOnly, searchTerm, selectedCategory, selectedPriority]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getPriorityConfig = (priority: string) => {
    const config = ANNOUNCEMENT_PRIORITIES.find(p => p.value === priority);
    return config || ANNOUNCEMENT_PRIORITIES[1];
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

  const isAnnouncementActive = (announcement: Announcement) => {
    const now = new Date();
    return announcement.isActive && 
      now >= announcement.displayStartDate && 
      now <= announcement.displayEndDate;
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedAnnouncement(null);
  };

  const handleDelete = (id: string) => {
    deleteAnnouncement(id);
  };

  const handleToggleActive = (id: string) => {
    toggleAnnouncementActive(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loading size="md" className="mx-auto mb-4" />
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Bell className="w-8 h-8" />
              アナウンス
              {isAdmin && <Settings className="w-6 h-6 text-muted-foreground" />}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'お知らせの確認・作成・編集・削除を行います' : '重要なお知らせや最新情報をご確認ください'}
            </p>
          </div>
          {isAdmin && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  新しいアナウンス
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedAnnouncement ? 'アナウンスの編集' : '新しいアナウンス'}
                  </DialogTitle>
                </DialogHeader>
                <AnnouncementForm
                  announcement={selectedAnnouncement}
                  onClose={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAnnouncements.length}
              </div>
              <div className="text-sm text-muted-foreground">表示中のアナウンス</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredAnnouncements.filter(a => isAnnouncementActive(a)).length}
              </div>
              <div className="text-sm text-muted-foreground">有効なアナウンス</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredAnnouncements.filter(a => a.priority === 'urgent').length}
              </div>
              <div className="text-sm text-muted-foreground">緊急アナウンス</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredAnnouncements.filter(a => a.hasPopup).length}
              </div>
              <div className="text-sm text-muted-foreground">ポップアップ設定</div>
            </CardContent>
          </Card>
        </div>

        {/* フィルター */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              フィルター・検索
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="タイトル、内容、作成者で検索"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* カテゴリ */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全てのカテゴリ</SelectItem>
                  {ANNOUNCEMENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 優先度 */}
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="優先度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全ての優先度</SelectItem>
                  {ANNOUNCEMENT_PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* アクティブフィルタ */}
              <Button
                variant={showActiveOnly ? "default" : "outline"}
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className="w-full"
              >
                {showActiveOnly ? "有効のみ表示" : "全て表示"}
              </Button>

              {/* 管理者用の総数表示 */}
              {isAdmin && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  総計: {announcements.length}件
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* アナウンスリスト */}
        {filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">アナウンスが見つかりません</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? '検索条件に一致するアナウンスがありません。' : 'まだアナウンスが作成されていません。'}
              </p>
              {isAdmin && !searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  最初のアナウンスを作成
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement, index) => {
              const priorityConfig = getPriorityConfig(announcement.priority);
              const isActive = isAnnouncementActive(announcement);

              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`${isActive ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-300'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge 
                            variant={announcement.priority === 'urgent' ? 'destructive' : 'default'}
                            className={`${priorityConfig.color} ${announcement.priority === 'urgent' ? 'animate-pulse' : ''}`}
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(announcement.priority)}
                              {priorityConfig.label}
                            </div>
                          </Badge>
                          <Badge variant="secondary">
                            {announcement.category}
                          </Badge>
                          <Badge variant={isActive ? 'default' : 'outline'}>
                            {isActive ? '有効' : '無効'}
                          </Badge>
                          {announcement.hasPopup && (
                            <Badge variant="outline" className="text-blue-600">
                              ポップアップ
                            </Badge>
                          )}
                        </div>
                        
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(announcement.id)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {announcement.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(announcement)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>アナウンスを削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    この操作は取り消せません。アナウンス「{announcement.title}」を完全に削除します。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(announcement.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    削除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </div>
                      
                      <CardTitle className="text-xl leading-tight">
                        {announcement.title}
                      </CardTitle>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {announcement.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          作成: {formatDate(announcement.createdAt)}
                        </div>
                        {isAdmin && announcement.updatedAt.getTime() !== announcement.createdAt.getTime() && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            更新: {formatDate(announcement.updatedAt)}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none">
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {announcement.content}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted rounded-md text-sm">
                          <div>
                            <span className="font-medium">対象部署:</span><br />
                            {announcement.targetDepartments.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">表示期間:</span><br />
                            {formatDate(announcement.displayStartDate)} ～<br />
                            {formatDate(announcement.displayEndDate)}
                          </div>
                          {announcement.hasPopup && (
                            <div>
                              <span className="font-medium">ポップアップ:</span><br />
                              {announcement.popupDisplayCount || 0} / {announcement.maxPopupDisplays || '∞'} 回表示
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}