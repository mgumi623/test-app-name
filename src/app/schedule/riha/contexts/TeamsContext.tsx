'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface TeamsContextType {
  teams: Team[];
  loading: boolean;
  error: string | null;
  addTeam: (team: { name: string; description?: string }) => Promise<void>;
  removeTeam: (teamId: string) => Promise<void>;
  updateTeam: (teamId: string, updates: { name?: string; description?: string }) => Promise<void>;
  reorderTeams: (teamIds: string[]) => Promise<void>;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('teams')
        .select('*')
        .order('created_at');

      if (supabaseError) throw supabaseError;

      setTeams(data || []);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTeam = async (team: { name: string; description?: string }) => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('teams')
        .insert([team])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setTeams(prev => [...prev, data]);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeTeam = async (teamId: string) => {
    try {
      setLoading(true);
      const { error: supabaseError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (supabaseError) throw supabaseError;

      setTeams(prev => prev.filter(team => team.id !== teamId));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = async (teamId: string, updates: { name?: string; description?: string }) => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      setTeams(prev => prev.map(team => team.id === teamId ? data : team));
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reorderTeams = async (teamIds: string[]) => {
    // TODO: 順序の永続化が必要な場合は、teams テーブルに order カラムを追加
    try {
      setLoading(true);
      const reorderedTeams = teamIds
        .map(id => teams.find(team => team.id === id))
        .filter((team): team is Team => team !== undefined);
      setTeams(reorderedTeams);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return (
    <TeamsContext.Provider value={{ teams, loading, error, addTeam, removeTeam, updateTeam, reorderTeams }}>
      {children}
    </TeamsContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
}