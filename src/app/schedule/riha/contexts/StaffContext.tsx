'use client';

import React, { createContext, useContext } from 'react';
import { useStaffState } from '../hooks/useStaffState';
import { Staff } from '../data/staff';

interface StaffStateError {
  message: string;
  code?: string;
}

type SortField = 'name' | 'team' | 'position' | 'profession' | 'years';
type SortDirection = 'asc' | 'desc';

interface StaffContextType {
  // 基本データ
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  loading: boolean;
  error: StaffStateError | null;

  // CRUD操作
  createStaff: (newStaff: Omit<Staff, 'id'>) => Promise<Staff>;
  updateStaff: (id: string, updates: Partial<Omit<Staff, 'id'>>) => Promise<Staff>;
  deleteStaff: (id: string) => Promise<void>;
  fetchStaff: () => Promise<void>;

  // フィルタ・ソート機能
  getStaffByTeam: (team: string) => Staff[];
  getStaffByTeams: (teams: string[]) => Staff[];
  getSortedStaff: (field: SortField, direction?: SortDirection, teamFilter?: string | string[]) => Staff[];
  searchStaff: (query: string) => Staff[];
  getStaffByYearsRange: (minYears: number, maxYears: number) => Staff[];

  // エラーハンドリング
  clearError: () => void;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const staffState = useStaffState();

  return (
    <StaffContext.Provider value={staffState}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}