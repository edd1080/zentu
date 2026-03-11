import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        <input
          ref={ref}
          className={cn(
            "flex h-[48px] w-full rounded-[8px] border border-(--surface-border-strong) bg-white px-3 py-2 text-base text-(--text-primary) transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-(--text-tertiary) focus-visible:outline-none focus-visible:border-(--color-primary-700) focus-visible:ring-1 focus-visible:ring-(--color-primary-700) disabled:cursor-not-allowed disabled:bg-(--surface-muted) disabled:opacity-50",
            error && "border-(--color-error-500) focus-visible:ring-(--color-error-500) focus-visible:border-(--color-error-500)",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-(--color-error-500)">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
