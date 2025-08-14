'use client';

import React, { createContext, useContext } from 'react';
import { useStaffState } from '../hooks/useStaffState';
import { Staff } from '../data/staff';

interface StaffContextType {
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { staffList, setStaffList } = useStaffState();

  return (
    <StaffContext.Provider value={{ staffList, setStaffList }}>
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