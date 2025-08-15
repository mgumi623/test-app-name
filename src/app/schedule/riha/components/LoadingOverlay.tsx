'use client';

import { Spinner } from './ui/Spinner';

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8">
        <Spinner size="lg" />
      </div>
    </div>
  );
}