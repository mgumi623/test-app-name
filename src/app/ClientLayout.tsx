'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 初回マウント後に表示開始
    const timeout = setTimeout(() => {
      setMounted(true);
    }, 10); // 少し遅延させるのがポイント

    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) {
    // 初回描画時は空白
    return <div style={{ background: 'white', minHeight: '100vh' }} />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ minHeight: '100vh', overflowX: 'hidden' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}