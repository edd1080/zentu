"use client";

import { Brain, Info, AlertCircle, RefreshCw, PlusCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface Proposal {
  content: string;
  layer: 'structured' | 'operational' | 'learned' | 'narrative';
  topic: string;
  justification: string;
}

export interface ConflictingItem {
  id: string;
  content: string;
  layer: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  conflictingItems: ConflictingItem[];
  replaceMode: boolean;
  isProcessing: boolean;
  onReplaceMode: (value: boolean) => void;
  onConfirm: () => void;
  onCorrect: () => void;
}

export function ProposalCard({
  proposal,
  conflictingItems,
  replaceMode,
  isProcessing,
  onReplaceMode,
  onConfirm,
  onCorrect,
}: ProposalCardProps) {
  return (
    <div className="w-full bg-white border border-(--color-primary-200) rounded-2xl shadow-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 mb-3 text-(--color-primary-700)">
        <Brain className="h-5 w-5" />
        <h3 className="font-semibold text-lg italic font-display">¿Entendí bien?</h3>
      </div>

      <div className="bg-(--color-primary-50) rounded-xl p-4 border border-(--color-primary-100) mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-(--color-primary-700) bg-white px-2 py-0.5 rounded border border-(--color-primary-200)">
            {proposal.topic}
          </span>
          <span className="text-xs text-(--text-tertiary)">{proposal.layer}</span>
        </div>
        <p className="text-(--text-primary) text-base leading-relaxed">{proposal.content}</p>
        <div className="mt-3 pt-3 border-t border-(--color-primary-200)/30 flex items-start gap-2">
          <Info className="h-4 w-4 text-(--color-primary-600) shrink-0 mt-0.5" />
          <p className="text-xs text-(--text-secondary) italic">{proposal.justification}</p>
        </div>
      </div>

      {conflictingItems.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-2 mb-2 text-amber-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold">Ya existe una instrucción en esta área y capa</span>
          </div>
          <p className="text-xs text-amber-800 mb-3 line-clamp-2 italic">"{conflictingItems[0].content}"</p>
          <div className="flex bg-amber-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onReplaceMode(true)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${replaceMode ? 'bg-white text-amber-800 shadow-sm' : 'text-amber-600 hover:text-amber-800'}`}
            >
              <RefreshCw className="h-3 w-3" />
              Reemplazar
            </button>
            <button
              type="button"
              onClick={() => onReplaceMode(false)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${!replaceMode ? 'bg-white text-amber-800 shadow-sm' : 'text-amber-600 hover:text-amber-800'}`}
            >
              <PlusCircle className="h-3 w-3" />
              Agregar
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button className="flex-1 h-12 rounded-xl text-base font-semibold" onClick={onConfirm} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Check className="h-5 w-5 mr-2" />}
          Sí, guárdalo
        </Button>
        <button className="h-12 px-4 rounded-xl text-(--text-secondary) hover:bg-(--surface-muted) transition-colors font-medium text-sm" onClick={onCorrect} disabled={isProcessing}>
          Corregir
        </button>
      </div>
    </div>
  );
}
