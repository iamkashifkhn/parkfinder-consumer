import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  text?: string;
  subText?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  minHeight?: string;
}

export function Loader({
  text = "Loading...",
  subText,
  className,
  size = "md",
  minHeight = "400px",
}: LoaderProps) {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        className
      )}
      style={{ minHeight }}
    >
      <Loader2 className={cn(sizeMap[size], "animate-spin text-gray-500 mb-4")} />
      <p className="text-lg font-medium text-gray-600">{text}</p>
      {subText && <p className="text-sm text-gray-500">{subText}</p>}
    </div>
  );
} 