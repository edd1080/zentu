"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface TrainingOpportunityCardProps {
  topicName: string;
  escalationCount: number;
  topicId: string;
}

export function TrainingOpportunityCard({ topicName, escalationCount, topicId }: TrainingOpportunityCardProps) {
  return (
    <Link
      href={`/dashboard/agent?train=${encodeURIComponent(topicName)}`}
      className="flex flex-col gap-3 p-4 bg-amber-50/60 border border-amber-200/60 rounded-2xl hover:shadow-sm hover:border-amber-300/80 transition-all group"
    >
      <div className="w-9 h-9 rounded-xl bg-amber-100/80 flex items-center justify-center shrink-0">
        <Icon name="solar:danger-triangle-linear" size={17} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{topicName}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {escalationCount} situación{escalationCount !== 1 ? "es" : ""} sin respuesta en los últimos 7 días
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-[#3DC185] group-hover:gap-2 transition-all">
        <span>Entrenar ahora</span>
        <Icon name="solar:alt-arrow-right-linear" size={12} />
      </div>
    </Link>
  );
}
