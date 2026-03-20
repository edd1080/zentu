"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { ChevronRight, Loader2, Zap, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export interface Topic {
  id: string;
  name: string;
  coverage_percentage: number;
  approval_rate_7d: number;
  incident_count_7d: number;
}

export interface Indicator {
  label: string;
  ok: boolean;
  value: string;
}

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

interface Props {
  topic: Topic;
  autonomous: boolean;
  expanded: boolean;
  toggling: boolean;
  onExpand: () => void;
  onToggle: () => void;
}

export function TopicAutonomyCard({ topic, autonomous, expanded, toggling, onExpand, onToggle }: Props) {
  const eligible = canActivate(topic);
  const indicators = getIndicators(topic);

  return (
    <div className="bg-white border border-(--surface-border) rounded-xl overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left" onClick={onExpand}>
        <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${autonomous ? "bg-emerald-100" : eligible ? "bg-amber-50" : "bg-(--surface-muted)"}`}>
          <Zap className={`h-4 w-4 ${autonomous ? "text-emerald-700" : eligible ? "text-amber-600" : "text-(--text-tertiary)"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-(--text-primary)">{topic.name}</p>
          <p className={`text-xs ${autonomous ? "text-emerald-700" : eligible ? "text-amber-600" : "text-(--text-tertiary)"}`}>
            {autonomous ? "Modo autónomo activo" : eligible ? "Listo para autonomía" : "Requiere más entrenamiento"}
          </p>
        </div>
        <ChevronRight className={`h-4 w-4 text-(--text-tertiary) shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-(--surface-border) pt-3 space-y-3">
          <div className="space-y-2">
            {indicators.map(ind => (
              <div key={ind.label} className="flex items-center gap-2">
                {ind.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <XCircle className="h-4 w-4 text-(--text-tertiary) shrink-0" />}
                <div>
                  <p className="text-xs font-medium text-(--text-primary)">{ind.label}</p>
                  <p className="text-xs text-(--text-secondary)">{ind.value}</p>
                </div>
              </div>
            ))}
          </div>
          {!eligible && !autonomous && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">Entrena más este tema y aprueba algunas respuestas para poder activar la autonomía.</p>
            </div>
          )}
          <Button variant={autonomous ? "secondary" : "primary"} className="w-full" onClick={onToggle} disabled={toggling}>
            {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : autonomous ? "Desactivar autonomía" : "Activar autonomía"}
          </Button>
        </div>
      )}
    </div>
  );
}
