"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Sparkles, Edit2, Check, X } from "lucide-react";

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
  isProcessing
}: AgentSuggestionWidgetProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(suggestionContent);

  const handleManualSend = () => {
    if (editValue.trim() && editValue !== suggestionContent) {
      onEdit(editValue);
    } else {
      onApprove(); // Treated as normal approve if unchanged
    }
  };

  return (
    <div className="w-full bg-white border border-(--color-primary-100) rounded-t-2xl sm:rounded-2xl p-4 shadow-lg animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-(--color-primary-600)" />
        <span className="text-sm font-semibold text-(--color-primary-700)">
          Borrador del Agente
        </span>
      </div>

      {!isEditing ? (
        <div className="bg-(--color-primary-50) rounded-xl p-4 mb-4 border border-(--color-primary-100)/50">
          <p className="text-[15px] text-(--text-primary) whitespace-pre-wrap">
            {suggestionContent}
          </p>
        </div>
      ) : (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full min-h-[100px] p-3 rounded-xl border-2 border-(--color-primary-500) focus:outline-none focus:ring-4 focus:ring-(--color-primary-100) transition-all mb-4 text-[15px] resize-none"
          autoFocus
        />
      )}

      <div className="flex items-center gap-2 sm:gap-3 w-full">
        {!isEditing ? (
          <>
            <Button
              variant="text"
              className="text-(--text-tertiary) hover:text-(--color-error-600) w-[48px] sm:w-auto h-[48px] px-0 sm:px-4 shrink-0 transition-colors"
              onClick={onReject}
              disabled={isProcessing}
            >
              <X className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">Descartar</span>
            </Button>
            
            <div className="flex-1"></div>

            <Button
              variant="secondary"
              className="h-[48px]"
              onClick={() => setIsEditing(true)}
              disabled={isProcessing}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>

            <Button
              variant="primary"
              className="h-[48px] bg-(--color-success-600) hover:bg-(--color-success-700) focus-visible:ring-(--color-success-600)"
              onClick={onApprove}
              isLoading={isProcessing}
            >
              <Check className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          </>
        ) : (
          <div className="flex w-full justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsEditing(false);
                setEditValue(suggestionContent); // reset
              }}
              disabled={isProcessing}
            >
               Cancelar
            </Button>
            <Button 
               variant="primary" 
               onClick={handleManualSend}
               isLoading={isProcessing}
            >
                Enviar y Enseñar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
