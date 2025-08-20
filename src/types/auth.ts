import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string;
  department: string;
  position: string;
  hospital: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}