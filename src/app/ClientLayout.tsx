'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useErrorTracking } from '@/hooks/useAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // グローバルエラー追跡
  useErrorTracking();

  useEffect(() => {
    // 初回マウント後に表示開始
    setMounted(true);
  }, []);

  if (!mounted) {
    // 初回描画時は透明な状態で待機
    return (
      <div 
        style={{ 
          minHeight: '100vh',
          opacity: 0,
          backgroundColor: 'hsl(var(--background))'
        }} 
      />
    );
  }

  return (
    <ThemeProvider>
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
            </motion.div>
          </AnimatePresence>
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}