"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export type AgentStatusType = "active" | "pending" | "learning_needed" | "urgent" | "disconnected";

interface AgentStatusBarProps {
  status: AgentStatusType;
  stats?: {
    handledToday?: number;
    pendingCount?: number;
    missingTopicsCount?: number;
  };
  className?: string;
}

export function AgentStatusBar({ status, stats, className }: AgentStatusBarProps) {
  const handled = stats?.handledToday ?? 0;
  const pending = stats?.pendingCount ?? 0;
  const missing = stats?.missingTopicsCount ?? 0;
  const isAmber = status === "pending" || status === "learning_needed";

  return (
    <Link
      href="/dashboard/conversations?filter=pending"
      className={cn(
        "block rounded-2xl p-5 shadow-sm relative overflow-hidden group transition-colors",
        isAmber
          ? "bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50/80"
          : "bg-emerald-50/40 border border-emerald-200/60 hover:bg-emerald-50/60",
        className
      )}
    >
      {/* Decorative blur */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none",
        isAmber ? "bg-amber-500/10" : "bg-emerald-500/10"
      )} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 relative",
            isAmber ? "border border-amber-100 text-amber-500" : "border border-emerald-100 text-emerald-500"
          )}>
            <Icon name={isAmber ? "solar:bell-bing-linear" : "solar:check-circle-linear"} size={24} />
            {status === "pending" && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-amber-500 border-2 border-white rounded-full" />
            )}
          </div>
          <div>
            <h2 className={cn(
              "text-base font-medium tracking-tight flex items-center gap-2 transition-colors",
              isAmber ? "text-slate-900 group-hover:text-amber-800" : "text-slate-900"
            )}>
              {isAmber ? "Aprobaciones pendientes" : "Agente activo"}
              <Icon
                name="solar:alt-arrow-right-linear"
                size={16}
                className={cn(
                  "transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                  isAmber ? "text-amber-500" : "text-emerald-500"
                )}
              />
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {isAmber
                ? `Tienes ${pending} respuesta${pending !== 1 ? "s" : ""} esperando tu revisión.`
                : `Tu agente atendió ${handled} conversaciones hoy.`}
            </p>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-xl border sm:self-stretch",
          isAmber ? "bg-white/70 border-amber-100/50" : "bg-white/70 border-emerald-100/50"
        )}>
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">Atendidas hoy</p>
            <p className="text-lg font-medium text-slate-900 tracking-tight">{handled}</p>
          </div>
          <div className="w-px h-8 bg-slate-200/60" />
          <div>
            <p className={cn("text-[10px] font-medium uppercase tracking-widest mb-0.5", isAmber ? "text-amber-600" : "text-emerald-600")}>
              Por aprobar
            </p>
            <p className={cn("text-lg font-medium tracking-tight", isAmber ? "text-amber-600" : "text-emerald-600")}>{pending}</p>
          </div>
          <div className="w-px h-8 bg-slate-200/60" />
          <div>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mb-0.5">Falta Info</p>
            <p className="text-lg font-medium text-slate-900 tracking-tight">{missing}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
