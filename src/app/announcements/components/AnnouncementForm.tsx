'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, Info, Bell, Save, X } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { 
  Announcement, 
  AnnouncementFormData,
  AnnouncementFormErrors,
  ANNOUNCEMENT_CATEGORIES, 
  ANNOUNCEMENT_PRIORITIES,
  DEPARTMENTS 
} from '@/types/announcement';

interface AnnouncementFormProps {
  announcement?: Announcement | null;
  onClose: () => void;
}

export default function AnnouncementForm({ announcement, onClose }: AnnouncementFormProps) {
  const { addAnnouncement, updateAnnouncement } = useAnnouncements();
  
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    content: '',
    category: ANNOUNCEMENT_CATEGORIES[0],
    priority: 'normal',
    displayStartDate: '',
    displayEndDate: '',
    targetDepartments: ['全部署'],
    hasPopup: false,
    maxPopupDisplays: 1
  });

  const [errors, setErrors] = useState<AnnouncementFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編集時の初期値設定
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        content: announcement.content,
        category: announcement.category,
        priority: announcement.priority,
        displayStartDate: announcement.displayStartDate.toISOString().slice(0, 16),
        displayEndDate: announcement.displayEndDate.toISOString().slice(0, 16),
        targetDepartments: announcement.targetDepartments,
        hasPopup: announcement.hasPopup,
        maxPopupDisplays: announcement.maxPopupDisplays
      });
    } else {
      // 新規作成時のデフォルト値
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      setFormData(prev => ({
        ...prev,
        displayStartDate: now.toISOString().slice(0, 16),
        displayEndDate: nextWeek.toISOString().slice(0, 16)
      }));
    }
  }, [announcement]);

  const handleInputChange = (field: keyof AnnouncementFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDepartmentChange = (department: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      targetDepartments: checked 
        ? [...prev.targetDepartments, department]
        : prev.targetDepartments.filter(d => d !== department)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: AnnouncementFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }

    if (!formData.content.trim()) {
      newErrors.content = '内容は必須です';
    }

    if (!formData.displayStartDate) {
      newErrors.displayStartDate = '表示開始日時は必須です';
    }

    if (!formData.displayEndDate) {
      newErrors.displayEndDate = '表示終了日時は必須です';
    }

    if (formData.displayStartDate && formData.displayEndDate) {
      const startDate = new Date(formData.displayStartDate);
      const endDate = new Date(formData.displayEndDate);
      
      if (startDate >= endDate) {
        newErrors.displayEndDate = '表示終了日時は開始日時より後に設定してください';
      }
    }

    if (formData.targetDepartments.length === 0) {
      newErrors.targetDepartments = '対象部署を最低1つ選択してください';
    }

    if (formData.hasPopup && formData.maxPopupDisplays && formData.maxPopupDisplays < 1) {
      newErrors.maxPopupDisplays = 'ポップアップ最大表示回数は1回以上で設定してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (announcement) {
        await updateAnnouncement(announcement.id, formData);
      } else {
        await addAnnouncement(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const getPriorityColor = (priority: string) => {
    const config = ANNOUNCEMENT_PRIORITIES.find(p => p.value === priority);
    return config?.color || 'bg-blue-100 text-blue-800';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* プレビュー */}
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardHeader>
          <CardTitle className="text-lg">プレビュー</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getPriorityColor(formData.priority)}>
                <div className="flex items-center gap-1">
                  {getPriorityIcon(formData.priority)}
                  {ANNOUNCEMENT_PRIORITIES.find(p => p.value === formData.priority)?.label}
                </div>
              </Badge>
              <Badge variant="secondary">
                {formData.category}
              </Badge>
              {formData.hasPopup && (
                <Badge variant="outline" className="text-blue-600">
                  ポップアップ表示
                </Badge>
              )}
            </div>
            
            <h3 className="text-lg font-semibold">
              {formData.title || 'タイトルを入力してください'}
            </h3>
            
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {formData.content || '内容を入力してください'}
            </div>
            
            <div className="text-xs text-muted-foreground">
              対象: {formData.targetDepartments.join(', ')}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 基本情報 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">基本情報</h3>
          
          <div className="space-y-2">
            <Label htmlFor="title">タイトル *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="アナウンスのタイトル"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="アナウンスの内容を入力してください"
              rows={8}
              className={errors.content ? 'border-red-500' : ''}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANNOUNCEMENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">優先度</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANNOUNCEMENT_PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(priority.value)}
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 表示設定 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">表示設定</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayStartDate">表示開始日時 *</Label>
              <Input
                id="displayStartDate"
                type="datetime-local"
                value={formData.displayStartDate}
                onChange={(e) => handleInputChange('displayStartDate', e.target.value)}
                className={errors.displayStartDate ? 'border-red-500' : ''}
              />
              {errors.displayStartDate && (
                <p className="text-sm text-red-500">{errors.displayStartDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayEndDate">表示終了日時 *</Label>
              <Input
                id="displayEndDate"
                type="datetime-local"
                value={formData.displayEndDate}
                onChange={(e) => handleInputChange('displayEndDate', e.target.value)}
                className={errors.displayEndDate ? 'border-red-500' : ''}
              />
              {errors.displayEndDate && (
                <p className="text-sm text-red-500">{errors.displayEndDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>対象部署 *</Label>
            <div className="space-y-2">
              {DEPARTMENTS.map(department => (
                <div key={department} className="flex items-center space-x-2">
                  <Checkbox
                    id={department}
                    checked={formData.targetDepartments.includes(department)}
                    onCheckedChange={(checked) => 
                      handleDepartmentChange(department, checked as boolean)
                    }
                  />
                  <Label htmlFor={department} className="text-sm">
                    {department}
                  </Label>
                </div>
              ))}
            </div>
            {errors.targetDepartments && (
              <p className="text-sm text-red-500">{errors.targetDepartments}</p>
            )}
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPopup"
                checked={formData.hasPopup}
                onCheckedChange={(checked) => handleInputChange('hasPopup', checked)}
              />
              <Label htmlFor="hasPopup" className="text-sm font-medium">
                ポップアップで表示する
              </Label>
            </div>
            
            {formData.hasPopup && (
              <div className="space-y-2">
                <Label htmlFor="maxPopupDisplays">最大表示回数（空欄で無制限）</Label>
                <Input
                  id="maxPopupDisplays"
                  type="number"
                  min="1"
                  value={formData.maxPopupDisplays || ''}
                  onChange={(e) => handleInputChange('maxPopupDisplays', 
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                  placeholder="例: 1"
                  className={errors.maxPopupDisplays ? 'border-red-500' : ''}
                />
                {errors.maxPopupDisplays && (
                  <p className="text-sm text-red-500">{errors.maxPopupDisplays}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  ユーザーに対してポップアップを表示する最大回数を設定できます。
                  設定した回数に達すると、そのユーザーには表示されなくなります。
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className="flex items-center gap-4 pt-6 border-t">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              保存中...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {announcement ? '更新' : '作成'}
            </div>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          キャンセル
        </Button>
      </div>
    </form>
  );
}