'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';
import { SupabaseProvider } from '@/contexts/SupabaseContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from 'sonner';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 初回マウント後に表示開始
    console.log('[ClientLayout] Component mounted');
    setMounted(true);
  }, []);

  // マウント前は最小限の表示
  if (!mounted) {
    console.log('[ClientLayout] Not mounted yet, showing minimal layout');
    return (
      <div 
        style={{ 
          minHeight: '100vh',
          backgroundColor: 'hsl(var(--background))'
        }} 
      />
    );
  }

  console.log('[ClientLayout] Rendering full layout with pathname:', pathname);

  return (
    <SupabaseProvider>
      <AuthProvider>
        <ProtectedRoute>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -8 }}
              transition={{ 
                duration: 0.25, 
                ease: [0.25, 0.1, 0.25, 1.0],
                opacity: { duration: 0.15 }
              }}
              style={{ minHeight: '100vh' }}
            >
              {children}
              <Toaster position="top-right" richColors />
            </motion.div>
          </AnimatePresence>
        </ProtectedRoute>
      </AuthProvider>
    </SupabaseProvider>
  );
}