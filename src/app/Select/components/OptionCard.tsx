'use client';

import React from 'react';
import Image from 'next/image';
import { MoreHorizontal, MessageSquare, Calendar, Bell, BarChart3, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Option } from '../types';

interface OptionCardProps {
  option: Option;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

// アイコンマッピング（色分け対応）
const getIconConfig = (id: string) => {
  switch (id) {
    case 'ai-chat':
      return { 
        icon: MessageSquare, 
        color: 'text-green-600', 
        bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100',
        borderColor: 'border-green-200'
      };
    case 'schedule-riha':
      return { 
        icon: Calendar, 
        color: 'text-blue-600', 
        bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
        borderColor: 'border-blue-200'
      };
    case 'schedule-ns':
      return { 
        icon: Calendar, 
        color: 'text-teal-600', 
        bgColor: 'bg-gradient-to-br from-teal-50 to-teal-100',
        borderColor: 'border-teal-200'
      };
    case 'announcements':
      return { 
        icon: Bell, 
        color: 'text-orange-600', 
        bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
        borderColor: 'border-orange-200'
      };
    case 'corporate':
      return { 
        icon: Users, 
        color: 'text-purple-600', 
        bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
        borderColor: 'border-purple-200'
      };
    case 'admin-analytics':
      return { 
        icon: BarChart3, 
        color: 'text-emerald-600', 
        bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
        borderColor: 'border-emerald-200'
      };
    default:
      return { 
        icon: MessageSquare, 
        color: 'text-green-600', 
        bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100',
        borderColor: 'border-green-200'
      };
  }
};

// 画像マッピング（サービス別）
const getImageConfig = (id: string) => {
  switch (id) {
    case 'ai-chat':
      return {
        src: '/Icon/AI.svg',
        alt: 'AI Chat illustration'
      };
    case 'schedule-riha':
      return {
        src: '/Icon/シフトRiha.svg',
        alt: 'Rehabilitation Schedule illustration'
      };
    case 'schedule-ns':
      return {
        src: '/Icon/シフトNs.svg',
        alt: 'Nursing Schedule illustration'
      };
    case 'announcements':
      return {
        src: '/Icon/Noimage.svg',
        alt: 'Announcements illustration'
      };
    case 'corporate':
      return {
        src: '/Icon/Noimage.svg',
        alt: 'Corporate illustration'
      };
    case 'admin-analytics':
      return {
        src: '/Icon/管理.svg',
        alt: 'Analytics illustration'
      };
    default:
      return {
        src: '/Icon/Noimage.svg',
        alt: 'Service illustration'
      };
  }
};

// 部署カラーマッピング
const getDepartmentColor = (department: string) => {
  switch (department) {
    case 'リハビリテーション':
      return 'bg-blue-500';
    case '看護部':
      return 'bg-teal-500';
    case '管理':
      return 'bg-emerald-500';
    case '全科':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default function OptionCard({ option, isPending, onNavigate }: OptionCardProps) {
  const { icon: Icon, color, bgColor, borderColor } = getIconConfig(option.id);
  const { src, alt } = getImageConfig(option.id);

  const handleCardClick = () => {
    if (!isPending) {
      onNavigate(option);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Menu clicked for:', option.label);
  };

  return (
         <div
       onClick={handleCardClick}
       className={`
         relative group bg-white dark:bg-neutral-900 rounded-xl 
         border-2 border-gray-300 dark:border-neutral-600 cursor-pointer
         transition-all duration-300 ease-out overflow-hidden
         hover:shadow-2xl hover:-translate-y-[4px] hover:border-gray-400 dark:hover:border-neutral-500
         active:translate-y-[0px] active:shadow-xl
         focus-visible:ring-4 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-4 focus-visible:outline-none
         h-80 flex flex-col shadow-lg
         ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
       `}
      tabIndex={0}
      role="button"
      aria-label={`${option.label}を開く`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* メニューボタン */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleMenuClick}
        className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 backdrop-blur-sm z-10"
        aria-label="オプションメニュー"
      >
        <MoreHorizontal className="w-4 h-4" />
      </Button>

             {/* 上部：部署カラー帯 + 画像エリア */}
       <div className="relative h-48 overflow-hidden">
         {/* 部署カラー帯 */}
         <div className={`absolute top-0 left-0 right-0 h-16 ${getDepartmentColor(option.department)}`}></div>
         
                   {/* 画像エリア */}
          <div className="relative h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center">
            {/* サービス別画像 */}
            <Image
              src={src}
              alt={alt}
              width={200}
              height={200}
              className="w-40 h-40 opacity-70 group-hover:opacity-90 transition-opacity duration-300 drop-shadow-lg"
            />
            
            {/* 部署ラベル */}
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 dark:bg-neutral-800/95 text-gray-800 dark:text-gray-200 shadow-md border border-gray-200/50 dark:border-neutral-600/50">
                {option.department}
              </span>
            </div>
          </div>
       </div>

             {/* 下部：コンテンツエリア */}
       <div className="flex-1 p-6 flex flex-col justify-between bg-gradient-to-b from-white to-gray-50/50 dark:from-neutral-900 dark:to-neutral-800/50">
         <div className="space-y-4">
           {/* タイトル */}
           <h3 className="text-xl font-bold text-gray-900 dark:text-neutral-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2 leading-tight">
             {option.label}
           </h3>

           {/* 説明 */}
           {option.description && (
             <p className="text-sm text-gray-700 dark:text-neutral-300 line-clamp-3 leading-relaxed font-medium">
               {option.description}
             </p>
           )}
         </div>

         
       </div>
    </div>
  );
}