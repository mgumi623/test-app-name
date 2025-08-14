'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  currentView: string;
}

export default function PageTransition({ children, currentView }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ 
          opacity: 0,
          x: 100,  // 右から開始
        }}
        animate={{ 
          opacity: 1,
          x: 0,    // 中央に移動
        }}
        exit={{ 
          opacity: 0,
          x: -100, // 左に退場
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.3
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}