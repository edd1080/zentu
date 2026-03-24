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
      "px-5 py-4 shrink-0",
      "flex items-center justify-between",
      className
    )}>
      <h1 className="text-base font-semibold tracking-tight text-slate-900">{title}</h1>
      {action}
    </div>
  );
}
