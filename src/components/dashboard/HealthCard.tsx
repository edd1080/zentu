"use client";

import { Sparkles } from "lucide-react";

interface HealthCardProps {
  healthScore: number;
  healthLevel: string;
  coveredCore: number;
  totalCore: number;
}

export function HealthCard({ healthScore, healthLevel, coveredCore, totalCore }: HealthCardProps) {
  return (
    <section className="bg-(--color-primary-900) text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-300" />
          </div>
          <span className="text-sm font-medium text-emerald-100 italic">Salud Operativa</span>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <span className="text-5xl font-display italic">{healthScore}%</span>
          <div className="flex flex-col pb-1">
            <span className="text-xs text-emerald-200 uppercase tracking-widest font-bold">Nivel: {healthLevel}</span>
            <div className="h-1.5 w-24 bg-white/20 rounded-full mt-1">
              <div
                className="h-full bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                style={{ width: `${healthScore}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase text-emerald-200 font-bold block mb-1">Áreas Cubiertas</span>
            <span className="text-xl font-semibold">{coveredCore} / {totalCore}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase text-emerald-200 font-bold block mb-1">Sin Cubrir</span>
            <span className="text-xl font-semibold">{totalCore - coveredCore}</span>
          </div>
        </div>
      </div>

      <div className="absolute -right-10 -top-10 h-40 w-40 bg-emerald-500/20 rounded-full blur-3xl" />
      <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
    </section>
  );
}
