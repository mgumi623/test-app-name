'use client';

import { useState, useEffect, useCallback } from 'react';
import { Staff, POSITION_PRIORITY, PROFESSION_PRIORITY } from '../data/staff';
import { generateStaffData } from '../data/generateStaffData';
import { supabase } from '../../../../lib/supabase';
import { useTeams } from '../contexts/TeamsContext';

type SortField = 'name' | 'team' | 'position' | 'profession' | 'years';
type SortDirection = 'asc' | 'desc';

interface StaffStateError {
  message: string;
  code?: string;
}

export function useStaffState() {
  const { teams } = useTeams();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<StaffStateError | null>(null);

  // データベースからスタッフリストを取得
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching staff data...');
      const { data: existingData, error: checkError } = await supabase
        .from('staff')
        .select('count')
        .single();

      // データが存在しない場合、初期データを生成してDBに挿入
      if (!existingData || existingData.count === 0) {
        console.log('No data found, generating initial data...');
        const initialData = generateStaffData(teams);
        const { data: insertedData, error: insertError } = await supabase
          .from('staff')
          .insert(initialData)
          .select();

        if (insertError) {
          throw new Error(`初期データ作成エラー: ${insertError.message}`);
        }

        console.log('Initial data inserted:', insertedData);
        setStaffList(insertedData || []);
      } else {
        // 既存データを取得
        const { data, error: fetchError } = await supabase
          .from('staff')
          .select('*')
          .order('created_at');

        if (fetchError) {
          throw new Error(`データ取得エラー: ${fetchError.message}`);
        }

        console.log('Fetched existing data:', data);
        setStaffList(data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'スタッフデータの取得に失敗しました';
      console.error('Error fetching staff:', errorMessage);
      setError({ message: errorMessage });
      
      // エラー時は空のリストを設定
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, [teams]);

  // スタッフを作成
  const createStaff = useCallback(async (newStaff: Omit<Staff, 'id'>) => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('staff')
        .insert([newStaff])
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`スタッフ作成エラー: ${supabaseError.message}`);
      }

      setStaffList(prev => [...prev, data]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'スタッフの作成に失敗しました';
      setError({ message: errorMessage });
      throw err;
    }
  }, []);

  // 複数スタッフを作成（初期データ用）
  const createMultipleStaff = useCallback(async (staffArray: Staff[]) => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('staff')
        .insert(staffArray)
        .select();

      if (supabaseError) {
        throw new Error(`複数スタッフ作成エラー: ${supabaseError.message}`);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '複数スタッフの作成に失敗しました';
      setError({ message: errorMessage });
      throw err;
    }
  }, []);

  // スタッフを更新
  const updateStaff = useCallback(async (id: string, updates: Partial<Omit<Staff, 'id'>>) => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw new Error(`スタッフ更新エラー: ${supabaseError.message}`);
      }

      setStaffList(prev => prev.map(staff => staff.id === id ? data : staff));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'スタッフの更新に失敗しました';
      setError({ message: errorMessage });
      throw err;
    }
  }, []);

  // スタッフを削除
  const deleteStaff = useCallback(async (id: string) => {
    try {
      setError(null);
      const { error: supabaseError } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw new Error(`スタッフ削除エラー: ${supabaseError.message}`);
      }

      setStaffList(prev => prev.filter(staff => staff.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'スタッフの削除に失敗しました';
      setError({ message: errorMessage });
      throw err;
    }
  }, []);

  // チームでフィルタ
  const getStaffByTeam = useCallback(async (team: string) => {
    try {
      setLoading(true);
      console.log('Fetching staff data for team:', team);
      
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('team', team)
        .order('position', { ascending: false })
        .order('years', { ascending: false });

      if (error) {
        throw new Error(`チームデータ取得エラー: ${error.message}`);
      }

      console.log('Fetched team staff data:', data);
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'チームスタッフデータの取得に失敗しました';
      console.error('Error fetching team staff:', errorMessage);
      setError({ message: errorMessage });
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 複数チームでフィルタ
  const getStaffByTeams = useCallback((teams: string[]) => {
    return staffList.filter(staff => teams.includes(staff.team));
  }, [staffList]);

  // ソート機能
  const getSortedStaff = useCallback((
    field: SortField,
    direction: SortDirection = 'asc',
    teamFilter?: string | string[]
  ) => {
    // チームフィルタを最初に適用
    let filteredStaff = teamFilter
      ? Array.isArray(teamFilter)
        ? staffList.filter(staff => teamFilter.includes(staff.team))
        : staffList.filter(staff => staff.team === teamFilter)
      : staffList;

    return [...filteredStaff].sort((a, b) => {
      let aValue: any = a[field];
      let bValue: any = b[field];

      // 役職の場合は優先度でソート
      if (field === 'position') {
        aValue = POSITION_PRIORITY[a.position] || 0;
        bValue = POSITION_PRIORITY[b.position] || 0;
      }
      // 職種の場合は優先度でソート
      else if (field === 'profession') {
        aValue = PROFESSION_PRIORITY[a.profession] || 0;
        bValue = PROFESSION_PRIORITY[b.profession] || 0;
      }

      if (direction === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [staffList, getStaffByTeam, getStaffByTeams]);

  // 高度な検索・フィルタ機能
  const searchStaff = useCallback((query: string) => {
    if (!query.trim()) return staffList;

    const lowercaseQuery = query.toLowerCase();
    return staffList.filter(staff =>
      staff.name.toLowerCase().includes(lowercaseQuery) ||
      staff.team.toLowerCase().includes(lowercaseQuery) ||
      staff.position.toLowerCase().includes(lowercaseQuery) ||
      staff.profession.toLowerCase().includes(lowercaseQuery)
    );
  }, [staffList]);

  // 経験年数範囲でフィルタ
  const getStaffByYearsRange = useCallback((minYears: number, maxYears: number) => {
    return staffList.filter(staff => staff.years >= minYears && staff.years <= maxYears);
  }, [staffList]);

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 初期データ読み込み
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // データベースとの同期を維持
  useEffect(() => {
    const subscription = supabase
      .channel('staff_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'staff' 
      }, async (payload) => {
        // データ変更時に最新データを再取得
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('created_at');
          
        if (!error && data) {
          setStaffList(data);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    // 基本データ
    staffList,
    setStaffList,
    loading,
    error,

    // CRUD操作
    createStaff,
    updateStaff,
    deleteStaff,
    fetchStaff,

    // フィルタ・ソート機能
    getStaffByTeam,
    getStaffByTeams,
    getSortedStaff,
    searchStaff,
    getStaffByYearsRange,

    // エラーハンドリング
    clearError,
  };
}