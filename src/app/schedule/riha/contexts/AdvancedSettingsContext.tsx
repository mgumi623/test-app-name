'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from '@/contexts/SupabaseContext';
import { toast } from 'sonner';

interface AdvancedSettings {
  weeklyFiveShifts: boolean;
  weekStartsSunday: boolean;
  seniorStaffAdjustment: boolean;
}

interface AdvancedSettingsContextType {
  settings: AdvancedSettings;
  updateSettings: (setting: keyof AdvancedSettings, value: boolean) => Promise<void>;
  isLoading: boolean;
}

const AdvancedSettingsContext = createContext<AdvancedSettingsContextType | undefined>(undefined);

export function AdvancedSettingsProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [settings, setSettings] = useState<AdvancedSettings>({
    weeklyFiveShifts: true,
    weekStartsSunday: true,
    seniorStaffAdjustment: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      // id = 1 の設定行を前提として取得。無ければ作成。
      const { data, error } = await supabase
        .from('admin_settings')
        .select('id, weekly_five_shifts, weekly_sunday, senior_staff_adjustment')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // デフォルト行を作成
        const { error: upsertError } = await supabase
          .from('admin_settings')
          .upsert({
            id: 1,
            weekly_five_shifts: true,
            weekly_sunday: true,
            senior_staff_adjustment: true,
          });
        if (upsertError) throw upsertError;

        setSettings({
          weeklyFiveShifts: true,
          weekStartsSunday: true,
          seniorStaffAdjustment: true,
        });
      } else {
        setSettings({
          weeklyFiveShifts: (data as any).weekly_five_shifts ?? true,
          weekStartsSunday: (data as any).weekly_sunday ?? true,
          seniorStaffAdjustment: (data as any).senior_staff_adjustment ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSettings(setting: keyof AdvancedSettings, value: boolean) {
    try {
      const columnName = setting === 'weeklyFiveShifts' ? 'weekly_five_shifts' : 
        setting === 'weekStartsSunday' ? 'weekly_sunday' : 
        'senior_staff_adjustment';

      const { error } = await supabase
        .from('admin_settings')
        .update({ [columnName]: value })
        .eq('id', 1);  // メインの設定レコード

      if (error) throw error;

      setSettings(prev => ({ ...prev, [setting]: value }));
      toast.success('設定を更新しました');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('設定の更新に失敗しました');
    }
  }

  return (
    <AdvancedSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </AdvancedSettingsContext.Provider>
  );
}

export function useAdvancedSettings() {
  const context = useContext(AdvancedSettingsContext);
  if (context === undefined) {
    throw new Error('useAdvancedSettings must be used within an AdvancedSettingsProvider');
  }
  return context;
}