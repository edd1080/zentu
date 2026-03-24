import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, action, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "sticky top-0 z-10 bg-white/90 backdrop-blur-md",
      "border-b border-slate-200/60",
      "h-16 px-5 shrink-0",
      "relative flex items-center justify-center",
      className
    )}>
      {/* Centered title */}
      <h1 className="text-base font-semibold tracking-tight text-slate-900 text-center">
        {title}
      </h1>

      {/* Action anchored to the right */}
      {action && (
        <div className="absolute right-5 inset-y-0 flex items-center">
          {action}
        </div>
      )}
    </div>
  );
}
