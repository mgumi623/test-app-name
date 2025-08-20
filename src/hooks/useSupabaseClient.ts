import { useEffect, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useSupabaseClient() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const initializeClient = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`);
        if (!response.ok) {
          throw new Error('Failed to connect to Supabase');
        }
        setClient(supabase);
        setError(null);
      } catch (err) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeClient, 1000 * retryCount);
        } else {
          setError(err instanceof Error ? err : new Error('Failed to initialize Supabase client'));
        }
      }
    };

    initializeClient();
  }, []);

  return { client, error };
}