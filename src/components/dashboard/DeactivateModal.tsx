"use client";

import { Icon } from "@/components/ui/Icon";
import type { HistoryItem } from "./HistoryCard";

interface DeactivateModalProps {
  item: HistoryItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeactivateModal({ item, onConfirm, onCancel }: DeactivateModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Icon name="solar:danger-triangle-linear" size={20} className="text-red-600" />
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <Icon name="solar:close-linear" size={18} />
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 text-base">¿Desactivar esta instrucción?</h3>
          <p className="text-sm text-slate-500 mt-1">Tu agente dejará de usar esta información. Puedes reactivarla cuando quieras.</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <p className="text-xs text-slate-600 italic line-clamp-3">"{item.content}"</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Desactivar
          </button>
        </div>
      </div>
    </div>
  );
}
