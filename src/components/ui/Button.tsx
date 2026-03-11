import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "text";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, children, disabled, ...props }, ref) => {
    // Determine base styles for variants
    const variantStyles = {
      primary:
        "bg-(--color-primary-700) text-white hover:bg-(--color-primary-800) active:bg-(--color-primary-900) border border-transparent shadow-sm",
      secondary:
        "bg-white text-(--text-primary) border border-(--surface-border-strong) hover:bg-(--surface-muted) active:bg-(--surface-border)",
      ghost:
        "bg-transparent text-(--text-primary) hover:bg-(--surface-muted) active:bg-(--surface-border)",
      destructive:
        "bg-(--color-error-500) text-white hover:bg-(--color-error-700) border border-transparent shadow-sm",
      text:
        "bg-transparent text-(--color-primary-700) hover:text-(--color-primary-800) hover:underline p-0 h-auto min-h-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-[8px] text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary-700) focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none min-h-[48px] px-4 py-2 relative",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <span
          className={cn("inline-flex items-center gap-2", isLoading && "opacity-0")}
        >
          {children}
        </span>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
