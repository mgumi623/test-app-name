export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  author: string;
  createdAt: Date;
  updatedAt: Date;
  displayStartDate: Date;
  displayEndDate: Date;
  targetDepartments: string[];
  isActive: boolean;
  hasPopup: boolean;
  popupDisplayCount?: number;
  maxPopupDisplays?: number;
}

export interface AnnouncementFormData {
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  displayStartDate: string;
  displayEndDate: string;
  targetDepartments: string[];
  hasPopup: boolean;
  maxPopupDisplays?: number;
}

export interface AnnouncementFormErrors {
  title?: string;
  content?: string;
  category?: string;
  priority?: string;
  displayStartDate?: string;
  displayEndDate?: string;
  targetDepartments?: string;
  hasPopup?: string;
  maxPopupDisplays?: string;
}

export const ANNOUNCEMENT_CATEGORIES = [
  '重要なお知らせ',
  'システムメンテナンス',
  'イベント情報',
  '研修・講習会',
  '健康管理',
  'その他'
] as const;

export const ANNOUNCEMENT_PRIORITIES = [
  { value: 'low', label: '低', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: '通常', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: '緊急', color: 'bg-red-100 text-red-800' }
] as const;

export const DEPARTMENTS = [
  '全部署',
  '看護部',
  'リハビリテーション部',
  '管理部',
  '研究部'
] as const;