import {
  Activity,
  Heart,
  MessageSquare,
  Bot,
} from 'lucide-react';
import { Option } from './types';

export const OPTIONS: Option[] = [
  {
    id: 'all-ai',
    department: '全部署',
    label: 'AI Chat',
    description: 'グループ共通のAIアシスタント',
    href: '/AIchat',
    Icon: Bot,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'nurse-shift',
    department: '看護部',
    label: 'シフト',
    description: '看護師のシフト作成・調整',
    href: '/schedule/ns',
    Icon: Heart,
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'rehab-plan',
    department: 'リハビリテーション部',
    label: '予定表',
    description: 'リハスタッフの予定・担当管理',
    href: '/schedule/riha',
    Icon: Activity,
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    id: 'all-corporate',
    department: '全部署',
    label: '意見交流',
    description: '社内の意見交換・アイデア共有',
    href: '/corporate',
    Icon: MessageSquare,
    gradient: 'from-violet-500 to-indigo-600',
  },
];