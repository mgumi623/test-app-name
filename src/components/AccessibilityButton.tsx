'use client';

import React, { useState } from 'react';
import { Settings, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '../contexts/ThemeContext';

export const AccessibilityButton: React.FC = () => {
  const { themeSettings, setThemeMode, setContrastMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        aria-label="アクセシビリティ設定"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-20">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4" />
                <span className="font-medium text-sm">アクセシビリティ設定</span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground font-medium">テーマモード</label>
                  <div className="mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setThemeMode('light');
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent text-left ${
                        themeSettings.themeMode === 'light' ? 'bg-accent' : ''
                      }`}
                    >
                      ライトモード
                      {themeSettings.themeMode === 'light' && <Check className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => {
                        setThemeMode('dark');
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent text-left ${
                        themeSettings.themeMode === 'dark' ? 'bg-accent' : ''
                      }`}
                    >
                      ダークモード
                      {themeSettings.themeMode === 'dark' && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground font-medium">コントラスト</label>
                  <div className="mt-1 space-y-1">
                    <button
                      onClick={() => {
                        setContrastMode('normal');
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent text-left ${
                        themeSettings.contrastMode === 'normal' ? 'bg-accent' : ''
                      }`}
                    >
                      標準コントラスト
                      {themeSettings.contrastMode === 'normal' && <Check className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={() => {
                        setContrastMode('high');
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-accent text-left ${
                        themeSettings.contrastMode === 'high' ? 'bg-accent' : ''
                      }`}
                    >
                      高コントラスト
                      {themeSettings.contrastMode === 'high' && <Check className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AccessibilityButton;