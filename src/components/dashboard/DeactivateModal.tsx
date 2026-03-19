"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { HistoryItem } from "./HistoryCard";

interface DeactivateModalProps {
  item: HistoryItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeactivateModal({ item, onConfirm, onCancel }: DeactivateModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <button onClick={onCancel} className="text-(--text-tertiary) hover:text-(--text-primary) p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-(--text-primary) text-base">¿Desactivar esta instrucción?</h3>
          <p className="text-sm text-(--text-secondary) mt-1">
            Tu agente dejará de usar esta información. Puedes reactivarla cuando quieras.
          </p>
        </div>

        <div className="bg-(--surface-muted) rounded-xl p-3 border border-(--surface-border)">
          <p className="text-xs text-(--text-secondary) italic line-clamp-3">"{item.content}"</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-(--surface-border-strong) text-sm font-medium text-(--text-secondary) hover:bg-(--surface-muted) transition-colors"
          >
            Cancelar
          </button>
          <Button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl !bg-red-500 hover:!bg-red-600 text-white text-sm font-medium"
          >
            Sí, desactivar
          </Button>
        </div>
      </div>
    </div>
  );
}
