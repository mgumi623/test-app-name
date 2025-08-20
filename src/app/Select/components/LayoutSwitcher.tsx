'use client';

import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LayoutType = 'grid' | 'list';

interface LayoutSwitcherProps {
  currentLayout: LayoutType;
  onLayoutChange: (layout: LayoutType) => void;
}

export default function LayoutSwitcher({ currentLayout, onLayoutChange }: LayoutSwitcherProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm font-medium text-gray-700 mr-2">表示形式:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <Button
          variant={currentLayout === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('grid')}
          className={`
            flex items-center gap-2 px-3 py-1.5 text-sm
            ${currentLayout === 'grid' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Grid className="w-4 h-4" />
          グリッド
        </Button>
        <Button
          variant={currentLayout === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('list')}
          className={`
            flex items-center gap-2 px-3 py-1.5 text-sm
            ${currentLayout === 'list' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <List className="w-4 h-4" />
          リスト
        </Button>
      </div>
    </div>
  );
}