"use client";

import * as React from "react";
import { AgentSuggestionWidget } from "@/components/dashboard/AgentSuggestionWidget";
import { EscalationBannerWidget } from "@/components/dashboard/EscalationBannerWidget";
import { Icon } from "@/components/ui/Icon";

type SuggestionState = "active" | "escalated" | "handled";

interface ThreadActionBarProps {
  suggestionState: SuggestionState;
  activeSuggestion: any;
  activeEscalation: any;
  dismissedSuggestion: any;
  isProcessing: boolean;
  onApprove: () => void;
  onEdit: (text: string) => void;
  onReject: () => void;
  onAttend: () => void;
  onSendDirect: (text: string) => void;
  onRestoreDismissed: () => void;
}

export function ThreadActionBar({ suggestionState, activeSuggestion, activeEscalation, dismissedSuggestion, isProcessing, onApprove, onEdit, onReject, onAttend, onSendDirect, onRestoreDismissed }: ThreadActionBarProps) {
  const [manualReply, setManualReply] = React.useState("");

  const sendReply = () => {
    if (!manualReply.trim()) return;
    onSendDirect(manualReply);
    setManualReply("");
  };

  const escalationType = activeEscalation?.level === "urgent" ? "urgent" : activeEscalation?.level === "sensitive" ? "escalated_sensitive" : "escalated_info";

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 shrink-0 p-4 pb-safe shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-2">
        {suggestionState === "active" && activeSuggestion && (
          <AgentSuggestionWidget suggestionContent={activeSuggestion.content} onApprove={onApprove} onEdit={onEdit} onReject={onReject} isProcessing={isProcessing} />
        )}

        {suggestionState === "escalated" && activeEscalation && (
          <div className="w-full bg-white rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.08)] p-4 border border-slate-200">
            <EscalationBannerWidget type={escalationType} reason={activeEscalation.reason} onSendDirect={onSendDirect} onAttend={onAttend} isProcessing={isProcessing} />
          </div>
        )}

        {suggestionState === "handled" && dismissedSuggestion && (
          <button onClick={onRestoreDismissed} className="w-full flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 hover:bg-emerald-100 transition-colors">
            <Icon name="solar:stars-linear" size={16} className="shrink-0" />
            <span className="flex-1 text-left truncate">Borrador descartado — toca para verlo de nuevo</span>
          </button>
        )}

        {suggestionState === "handled" && (
          <div className="w-full bg-white border border-slate-200 rounded-2xl flex items-center p-1 shadow-sm focus-within:ring-2 focus-within:ring-[#3DC185] focus-within:border-[#3DC185] transition-all">
            <input
              type="text"
              value={manualReply}
              onChange={e => setManualReply(e.target.value)}
              placeholder="Escribe un mensaje libre..."
              className="flex-1 bg-transparent border-none px-4 py-3 h-12 text-sm focus:outline-none"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
            />
            <button onClick={sendReply} disabled={!manualReply.trim() || isProcessing} className="h-10 w-10 rounded-xl flex items-center justify-center bg-[#3DC185] hover:bg-[#32a873] text-white shrink-0 ml-1 disabled:opacity-40 transition-colors">
              <Icon name="solar:plain-2-linear" size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
