'use client';

import { createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

type SupabaseContextType = {
  supabase: typeof supabase;
};

const SupabaseContext = createContext<SupabaseContextType>({ supabase });

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}