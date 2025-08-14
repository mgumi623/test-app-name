import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  return (
    <div className="flex items-center justify-center">
      <img
        src="/image/clover.svg"
        alt="Loading..."
        className={cn(
          "smooth-spin",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}