"use client";

import * as React from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface AgentSuggestionWidgetProps {
  suggestionContent: string;
  onApprove: () => void;
  onEdit: (content: string) => void;
  onReject: () => void;
  isProcessing?: boolean;
}

export function AgentSuggestionWidget({
  suggestionContent,
  onApprove,
  onEdit,
  onReject,
  isProcessing,
}: AgentSuggestionWidgetProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(suggestionContent);

  const handleSend = () => {
    if (editValue.trim() && editValue !== suggestionContent) {
      onEdit(editValue);
    } else {
      onApprove();
    }
  };

  return (
    <div className="w-full bg-emerald-50/60 border border-emerald-200/60 rounded-2xl overflow-hidden shadow-sm transition-all hover:border-emerald-300/50">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-emerald-100/50 flex items-center gap-2 bg-emerald-50/80">
        <Icon name="solar:stars-linear" size={14} className="text-emerald-600 shrink-0" />
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
          Sugerencia lista para enviar
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            className="w-full min-h-[80px] p-3 rounded-xl border-2 border-[#3DC185] focus:outline-none focus:ring-4 focus:ring-[#3DC185]/10 transition-all text-sm resize-none bg-white"
            autoFocus
          />
        ) : (
          <p className="text-sm text-emerald-950 leading-relaxed">{suggestionContent}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => { setIsEditing(false); setEditValue(suggestionContent); }}
              disabled={isProcessing}
              className="flex-1 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={isProcessing}
              className="flex-[1.5] h-12 rounded-xl bg-[#3DC185] hover:bg-[#32a873] text-white flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              {isProcessing ? "Enviando..." : "Enviar"}
              <Icon name="solar:plain-2-linear" size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onReject}
              disabled={isProcessing}
              className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shrink-0 shadow-sm"
              title="Descartar"
            >
              <Icon name={cn("solar:close-circle-linear") as string} size={20} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isProcessing}
              className="flex-1 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Icon name="solar:pen-linear" size={16} />
              Editar
            </button>
            <button
              onClick={onApprove}
              disabled={isProcessing}
              className="flex-[1.5] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 text-sm font-medium transition-all shadow-sm active:scale-[0.98] disabled:opacity-60"
            >
              {isProcessing ? "Aprobando..." : "Aprobar"}
              <Icon name="solar:plain-2-linear" size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
