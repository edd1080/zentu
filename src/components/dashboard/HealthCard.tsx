"use client";

import { Icon } from "@/components/ui/Icon";

interface HealthCardProps {
  healthScore: number;
  healthLevel: string;
  coveredCore: number;
  totalCore: number;
}

export function HealthCard({ healthScore, healthLevel, coveredCore, totalCore }: HealthCardProps) {
  return (
    <section className="bg-emerald-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl -ml-8 -mb-8 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Icon name="solar:heart-pulse-linear" size={14} className="text-emerald-300" />
          </div>
          <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Salud Operativa</span>
        </div>

        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="text-5xl font-semibold leading-none">{healthScore}%</span>
            <p className="text-xs text-emerald-300 mt-1.5 font-medium">{healthLevel}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10">
              <Icon name="solar:check-circle-linear" size={13} className="text-emerald-300 shrink-0" />
              <span className="text-xs font-semibold">{coveredCore}/{totalCore} áreas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5 border border-white/10">
              <Icon name="solar:danger-circle-linear" size={13} className="text-amber-300 shrink-0" />
              <span className="text-xs font-semibold">{totalCore - coveredCore} sin cubrir</span>
            </div>
          </div>
        </div>

        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-700"
            style={{ width: `${healthScore}%` }}
          />
        </div>
      </div>
    </section>
  );
}
