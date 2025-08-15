'use client';

import { ReactNode, useState, useEffect } from 'react';
import { LoadingOverlay } from './LoadingOverlay';

interface PageTransitionProps {
  children: ReactNode;
  currentView: string;
}

export default function PageTransition({ children, currentView }: PageTransitionProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentView]);

  return (
    <div className="relative min-h-[200px]">
      {isLoading ? (
        <LoadingOverlay />
      ) : (
        children
      )}
    </div>
  );
}