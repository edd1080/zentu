"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export interface Topic {
  id: string; name: string; coverage_percentage: number;
  approval_rate_7d: number; incident_count_7d: number;
}
export interface Indicator { label: string; ok: boolean; value: string; }

export function getIndicators(topic: Topic): Indicator[] {
  return [
    { label: "Cobertura de conocimiento", ok: topic.coverage_percentage >= 70, value: `${topic.coverage_percentage}% (mínimo 70%)` },
    { label: "Tasa de aprobación 7 días", ok: topic.approval_rate_7d >= 0.85, value: `${Math.round(topic.approval_rate_7d * 100)}% (mínimo 85%)` },
    { label: "Sin incidentes en 7 días", ok: topic.incident_count_7d === 0, value: topic.incident_count_7d === 0 ? "Sin incidentes" : `${topic.incident_count_7d} incidente(s)` },
  ];
}
export function canActivate(topic: Topic): boolean {
  return topic.coverage_percentage >= 70 && topic.approval_rate_7d >= 0.85 && topic.incident_count_7d === 0;
}

interface Props { topic: Topic; autonomous: boolean; expanded: boolean; toggling: boolean; onExpand: () => void; onToggle: () => void; }

export function TopicAutonomyCard({ topic, autonomous, expanded, toggling, onExpand, onToggle }: Props) {
  const indicators = getIndicators(topic);

  return (
    <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgb(0,0,0,0.02)] ring-1 ring-slate-200/50 overflow-hidden">
      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={onExpand}>
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-base font-medium text-slate-900">{topic.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{autonomous ? "Modo autónomo activo" : "Requiere tu aprobación"}</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <label
            className="relative flex items-center cursor-pointer"
            onClick={e => { e.stopPropagation(); onToggle(); }}
          >
            <input type="checkbox" className="sr-only peer" checked={autonomous} readOnly />
            <div className={cn(
              "w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#3DC185]",
              "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
              "after:bg-white after:border-slate-300 after:border after:rounded-full",
              "after:h-5 after:w-5 after:transition-all",
              "peer-checked:after:translate-x-5 peer-checked:after:border-white",
              toggling && "opacity-50"
            )} />
          </label>
          <Icon
            name="solar:alt-arrow-down-linear"
            size={20}
            className={cn("text-slate-400 transition-transform duration-200", expanded && "rotate-180")}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Requisitos para autonomía</p>
          <div className="space-y-3">
            {indicators.map(ind => (
              <div key={ind.label} className="flex items-start gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  ind.ok ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                )}>
                  <Icon name={ind.ok ? "solar:check-circle-linear" : "solar:close-circle-linear"} size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{ind.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ind.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
