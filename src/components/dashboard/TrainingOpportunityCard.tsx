"use client";

import * as React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface TrainingOpportunityCardProps {
  topicName: string;
  escalationCount: number;
  topicId: string;
}

export function TrainingOpportunityCard({ topicName, escalationCount, topicId }: TrainingOpportunityCardProps) {
  return (
    <Link
      href={`/dashboard/agent?train=${encodeURIComponent(topicName)}`}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-(--surface-border) rounded-xl hover:border-(--color-primary-700) hover:bg-emerald-50 transition-colors group"
    >
      <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-(--text-primary) truncate">{topicName}</p>
        <p className="text-xs text-(--text-secondary)">
          {escalationCount} situación{escalationCount !== 1 ? 'es' : ''} en los últimos 7 días
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-(--text-tertiary) group-hover:text-(--color-primary-700) shrink-0" />
    </Link>
  );
}
