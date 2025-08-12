'use client';

import React from 'react';
import { Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabels = false 
}) => {
  const { themeSettings, toggleThemeMode, toggleContrastMode } = useTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* テーマモード切り替え */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleThemeMode}
        className="h-9 w-9"
        aria-label={`${themeSettings.themeMode === 'light' ? 'ダーク' : 'ライト'}モードに切り替え`}
        title={`${themeSettings.themeMode === 'light' ? 'ダーク' : 'ライト'}モードに切り替え`}
      >
        {themeSettings.themeMode === 'light' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>

      {showLabels && (
        <span className="text-sm text-muted-foreground">
          {themeSettings.themeMode === 'light' ? 'ライト' : 'ダーク'}
        </span>
      )}

      {/* コントラストモード切り替え */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleContrastMode}
        className="h-9 w-9"
        aria-label={`${themeSettings.contrastMode === 'normal' ? '高' : '標準'}コントラストモードに切り替え`}
        title={`${themeSettings.contrastMode === 'normal' ? '高' : '標準'}コントラストモードに切り替え`}
      >
        {themeSettings.contrastMode === 'normal' ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
      </Button>

      {showLabels && (
        <span className="text-sm text-muted-foreground">
          {themeSettings.contrastMode === 'normal' ? '標準' : '高'}コントラスト
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;