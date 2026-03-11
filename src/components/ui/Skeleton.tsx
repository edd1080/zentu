import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "card";
}

function Skeleton({ className, variant = "text", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-(--surface-muted)",
        variant === "text" && "h-4 w-full",
        variant === "card" && "h-32 w-full rounded-xl",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
