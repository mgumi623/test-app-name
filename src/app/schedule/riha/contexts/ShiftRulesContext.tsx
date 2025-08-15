'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * シフトルールの定義
 * 
 * 機能：
 * - チームごとのシフトルール管理
 * - 最小必要人数の設定
 * - 更新/削除の追跡
 */
interface ShiftRule {
  id: string;
  team_id: string;
  position: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  minimum_staff_count: number;
  maximum_staff_count?: number;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ShiftRuleInput {
  team_id: string;
  position: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  minimum_staff_count: number;
  maximum_staff_count?: number;
  is_active?: boolean;
  notes?: string;
}

interface ShiftRulesContextType {
  rules: ShiftRule[];
  loading: boolean;
  error: string | null;
  addRule: (rule: ShiftRuleInput) => Promise<void>;
  updateRule: (ruleId: string, updates: Partial<ShiftRuleInput>) => Promise<void>;
  deleteRule: (ruleId: string) => Promise<void>;
  getRulesByTeam: (teamId: string) => ShiftRule[];
  getRulesByPosition: (position: string) => ShiftRule[];
  getRulesByDay: (dayOfWeek: number) => ShiftRule[];
  clearError: () => void;
}

const ShiftRulesContext = createContext<ShiftRulesContextType | undefined>(undefined);

/**
 * シフトルール管理のコンテキストプロバイダー
 * 
 * 主な機能：
 * 1. ルールの取得と管理
 * 2. ルールの追加/更新/削除
 * 3. チーム/役職/曜日ごとのフィルタリング
 * 
 * @param children - 子コンポーネント
 */
export function ShiftRulesProvider({ children }: { children: React.ReactNode }) {
  const [rules, setRules] = useState<ShiftRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('shift_rules')
        .select('*')
        .order('team_id')
        .order('day_of_week')
        .order('start_time');

      if (supabaseError) throw supabaseError;

      setRules(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      const supabaseError = err instanceof Error && 'code' in err ? `(${(err as any).code}) ${err.message}` : errorMessage;
      setError(supabaseError);
      console.error('Failed to fetch shift rules:', { error: err, details: supabaseError });
    } finally {
      setLoading(false);
    }
  }, []);

  const addRule = async (rule: ShiftRuleInput) => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('shift_rules')
        .insert([rule])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setRules(prev => [...prev, data]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      const supabaseError = err instanceof Error && 'code' in err ? `(${(err as any).code}) ${err.message}` : errorMessage;
      setError(supabaseError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<ShiftRuleInput>) => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('shift_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setRules(prev => prev.map(rule => rule.id === ruleId ? data : rule));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      const supabaseError = err instanceof Error && 'code' in err ? `(${(err as any).code}) ${err.message}` : errorMessage;
      setError(supabaseError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      setLoading(true);
      const { error: supabaseError } = await supabase
        .from('shift_rules')
        .delete()
        .eq('id', ruleId);

      if (supabaseError) throw supabaseError;

      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      const supabaseError = err instanceof Error && 'code' in err ? `(${(err as any).code}) ${err.message}` : errorMessage;
      setError(supabaseError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRulesByTeam = useCallback((teamId: string) => {
    return rules.filter(rule => rule.team_id === teamId);
  }, [rules]);

  const getRulesByPosition = useCallback((position: string) => {
    return rules.filter(rule => rule.position === position);
  }, [rules]);

  const getRulesByDay = useCallback((dayOfWeek: number) => {
    return rules.filter(rule => rule.day_of_week === dayOfWeek);
  }, [rules]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return (
    <ShiftRulesContext.Provider value={{
      rules,
      loading,
      error,
      addRule,
      updateRule,
      deleteRule,
      getRulesByTeam,
      getRulesByPosition,
      getRulesByDay,
      clearError
    }}>
      {children}
    </ShiftRulesContext.Provider>
  );
}

export function useShiftRules() {
  const context = useContext(ShiftRulesContext);
  if (context === undefined) {
    throw new Error('useShiftRules must be used within a ShiftRulesProvider');
  }
  return context;
}