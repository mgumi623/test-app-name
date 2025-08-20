import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "smooth" | "fast" | "once";
  className?: string;
}

export function Loading({ size = "md", variant = "smooth", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const animationClasses = {
    smooth: "smooth-spin",
    fast: "animate-spin",
    once: "rotate-once"
  };

  return (
    <div className="flex items-center justify-center">
      <img
        src="/image/clover.svg"
        alt="Loading..."
        className={cn(
          animationClasses[variant],
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}