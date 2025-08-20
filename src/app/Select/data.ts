import { Option } from './types';

export const OPTIONS: Option[] = [
  {
    id: 'ai-chat',
    label: 'AIチャット',
    href: '/AIchat',
    department: '全部署',
    description: 'AIを活用したチャット機能で、業務に関する質問や相談に対応します。'
  },
  {
    id: 'schedule-riha',
    label: 'リハビリシフト管理',
    href: '/schedule/riha',
    department: 'リハビリ',
    description: 'リハビリテーション部門のスケジュール管理とシフト調整を行います。'
  },
  {
    id: 'schedule-ns',
    label: '看護シフト管理',
    href: '/schedule/ns',
    department: '看護',
    description: '看護部門のスケジュール管理とシフト調整を行います。'
  },
  {
    id: 'announcements',
    label: 'お知らせ',
    href: '/announcements',
    department: '全部署',
    description: '病院からのお知らせや連絡事項を確認できます。'
  },
  {
    id: 'corporate',
    label: '社内掲示板',
    href: '/corporate',
    department: '全部署',
    description: '社内での情報共有やコミュニケーションの場です。'
  },
  {
    id: 'admin-analytics',
    label: '管理分析',
    href: '/admin/analytics',
    department: '管理',
    description: '管理者向けの分析機能とレポート生成を行います。'
  }
];