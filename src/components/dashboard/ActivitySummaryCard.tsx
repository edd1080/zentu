"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ActivitySummaryCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon: React.ReactNode;
  accent?: "default" | "success" | "warning" | "info";
}

export function ActivitySummaryCard({ label, value, sublabel, icon, accent = "default" }: ActivitySummaryCardProps) {
  const accentClasses = {
    default: "bg-white border-(--surface-border)",
    success: "bg-emerald-50 border-emerald-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border shadow-sm", accentClasses[accent])}>
      <div className="mt-0.5 shrink-0 text-(--text-secondary)">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-(--text-tertiary) font-medium uppercase tracking-wide leading-none mb-1">{label}</p>
        <p className="text-2xl font-semibold text-(--text-primary) leading-none">{value}</p>
        {sublabel && <p className="text-xs text-(--text-secondary) mt-1">{sublabel}</p>}
      </div>
    </div>
  );
}
