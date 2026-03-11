import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "success" | "warning" | "urgent" | "neutral";
}

function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  const variantStyles = {
    success: "bg-(--color-success-100) text-(--color-success-700)",
    warning: "bg-(--color-warning-100) text-(--color-warning-700)",
    urgent: "bg-(--color-error-100) text-(--color-error-700)",
    neutral: "bg-(--surface-muted) text-(--text-secondary)",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-bold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
