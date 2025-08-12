'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';
export type ContrastMode = 'normal' | 'high';

interface ThemeSettings {
  themeMode: ThemeMode;
  contrastMode: ContrastMode;
}

interface ThemeContextType {
  themeSettings: ThemeSettings;
  setThemeMode: (mode: ThemeMode) => void;
  setContrastMode: (mode: ContrastMode) => void;
  toggleThemeMode: () => void;
  toggleContrastMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const THEME_STORAGE_KEY = 'accessibility-theme-settings';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    themeMode: 'light',
    contrastMode: 'normal',
  });

  // ローカルストレージからテーマ設定を読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ThemeSettings;
        setThemeSettings(parsed);
      } else {
        // システムの設定を確認
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        setThemeSettings({
          themeMode: prefersDark ? 'dark' : 'light',
          contrastMode: prefersHighContrast ? 'high' : 'normal',
        });
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  }, []);

  // テーマ設定をローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeSettings));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  }, [themeSettings]);

  // DOM クラスの更新
  useEffect(() => {
    const { themeMode, contrastMode } = themeSettings;
    const root = document.documentElement;
    
    // テーマモードクラスの更新
    root.classList.toggle('dark', themeMode === 'dark');
    
    // コントラストモードクラスの更新
    root.classList.toggle('high-contrast', contrastMode === 'high');
  }, [themeSettings]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeSettings(prev => ({ ...prev, themeMode: mode }));
  };

  const setContrastMode = (mode: ContrastMode) => {
    setThemeSettings(prev => ({ ...prev, contrastMode: mode }));
  };

  const toggleThemeMode = () => {
    setThemeMode(themeSettings.themeMode === 'light' ? 'dark' : 'light');
  };

  const toggleContrastMode = () => {
    setContrastMode(themeSettings.contrastMode === 'normal' ? 'high' : 'normal');
  };

  const value = {
    themeSettings,
    setThemeMode,
    setContrastMode,
    toggleThemeMode,
    toggleContrastMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};