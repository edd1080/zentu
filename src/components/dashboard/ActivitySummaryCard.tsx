"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface ActivitySummaryCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: string;
  accent?: "default" | "success" | "warning" | "info";
}

const ACCENT: Record<string, { card: string; icon: string }> = {
  default: { card: "bg-white border-slate-200/80",         icon: "text-slate-500"   },
  success: { card: "bg-emerald-50 border-emerald-200/80",  icon: "text-emerald-600" },
  warning: { card: "bg-amber-50 border-amber-200/80",      icon: "text-amber-600"   },
  info:    { card: "bg-blue-50 border-blue-200/80",        icon: "text-blue-600"    },
};

export function ActivitySummaryCard({ label, value, sublabel, icon, accent = "default" }: ActivitySummaryCardProps) {
  const a = ACCENT[accent];
  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-2xl border shadow-sm", a.card)}>
      <div className={cn("mt-0.5 shrink-0", a.icon)}>
        <Icon name={icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide leading-none mb-1.5">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 leading-none">{value}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sublabel}</p>}
      </div>
    </div>
  );
}
