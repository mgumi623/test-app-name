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
    <div className="flex items-center gap-2">
      <div className="flex bg-gray-100 rounded-md p-0.5">
        <Button
          variant={currentLayout === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('grid')}
          className={`
            flex items-center gap-1.5 px-2 py-1 text-xs
            ${currentLayout === 'grid' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <Grid className="w-3 h-3" />
          グリッド
        </Button>
        <Button
          variant={currentLayout === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onLayoutChange('list')}
          className={`
            flex items-center gap-1.5 px-2 py-1 text-xs
            ${currentLayout === 'list' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          <List className="w-3 h-3" />
          リスト
        </Button>
      </div>
    </div>
  );
}