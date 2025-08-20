'use client';

import React from 'react';
import OptionCard from './OptionCard';
import { Option } from '../types';

interface GridLayoutProps {
  options: Option[];
  selectedId: string | null;
  isPending: boolean;
  onNavigate: (option: Option) => void;
}

// スケルトンカードコンポーネント
const SkeletonCard = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 h-80 animate-pulse overflow-hidden">
    {/* 上部：写真エリアのスケルトン */}
    <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
      <div className="w-32 h-32 bg-gray-200 dark:bg-neutral-700 rounded-lg"></div>
    </div>
    
    {/* 下部：コンテンツエリアのスケルトン */}
    <div className="p-6 space-y-3">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-5/6"></div>
      </div>
      <div className="pt-3 border-t border-gray-100 dark:border-neutral-700">
        <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

export default function GridLayout({ options, selectedId, isPending, onNavigate }: GridLayoutProps) {
  if (options.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-700 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">
            該当する機能が見つかりません
          </h3>
          <p className="text-sm text-gray-600 dark:text-neutral-400">
            検索条件を変更してお試しください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
      {options.map((option) => (
        <OptionCard
          key={option.id}
          option={option}
          isPending={isPending && selectedId === option.id}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

// スケルトン状態用のエクスポート
export { SkeletonCard };