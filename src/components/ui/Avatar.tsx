import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

function Avatar({ className, name, src, size = "md", ...props }: AvatarProps) {
  // Deterministic color based on name
  const colors = [
    "bg-(--color-primary-100) text-(--color-primary-700)",
    "bg-(--color-success-100) text-(--color-success-700)",
    "bg-(--color-warning-100) text-(--color-warning-700)",
    "bg-(--color-info-100) text-(--color-info-700)",
  ];
  
  const colorIndex = name.length > 0 ? name.charCodeAt(0) % colors.length : 0;
  const initial = name.charAt(0).toUpperCase();

  const sizeStyles = {
    sm: "h-[32px] w-[32px] text-xs",
    md: "h-[40px] w-[40px] text-sm",
    lg: "h-[48px] w-[48px] text-base",
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full items-center justify-center font-medium",
        sizeStyles[size],
        !src && colors[colorIndex],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}

export { Avatar };
