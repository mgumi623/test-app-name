import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  department: string | null;
  position: string | null;
  hospital: string | null;
  role: string | null;
  staff_id: string | null;
  profession: string | null;
  primary_hospital_id: string | null; // 主所属病院ID
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signUp: (email: string, password: string, name?: string) => Promise<{ user: User | null; error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearAuthError: () => void;
}
