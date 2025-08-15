'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div role="status" className={`flex items-center justify-center ${className}`}>
      <img
        src="/image/clover.svg" // public/image/clover.svg に合わせて修正
        alt="Loading..."
        className={`animate-[spin_1.2s_linear_infinite] ${sizeClasses[size]}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
