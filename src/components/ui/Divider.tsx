import * as React from "react";
import { cn } from "@/lib/utils";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

function Divider({ className, label, ...props }: DividerProps) {
  if (!label) {
    return (
      <div
        className={cn("h-px w-full bg-(--surface-border)", className)}
        {...props}
      />
    );
  }

  return (
    <div className={cn("relative w-full py-4", className)} {...props}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full h-px bg-(--surface-border)"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-(--surface-background) px-2 text-(--text-secondary) font-medium">
          {label}
        </span>
      </div>
    </div>
  );
}

export { Divider };
