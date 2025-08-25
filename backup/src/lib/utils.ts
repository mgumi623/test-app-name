import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// エラーハンドラー
export const handleSupabaseError = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as { message?: string; error_description?: string };
    return errorObj.message || errorObj.error_description || 'An error occurred';
  }
  
  return String(error);
};
