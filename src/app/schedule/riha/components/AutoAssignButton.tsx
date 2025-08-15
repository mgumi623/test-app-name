'use client';

import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

interface AutoAssignButtonProps {
  onClick: () => void;
}

export function AutoAssignButton({ onClick }: AutoAssignButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100 hover:border-purple-100 hover:bg-purple-50 transition-all duration-200"
      title="自動配置"
    >
      <Wand2 className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" />
      <span className="text-sm text-gray-500 group-hover:text-purple-600 font-medium">
        自動配置
      </span>
    </button>
  );
}