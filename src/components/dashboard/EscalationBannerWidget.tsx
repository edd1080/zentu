"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Info, AlertTriangle, AlertOctagon, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type EscalationType = "escalated_info" | "escalated_sensitive" | "urgent";

export interface EscalationBannerWidgetProps {
  type: EscalationType;
  reason: string;
  onSendDirect: (content: string) => void;
  isProcessing?: boolean;
}

export function EscalationBannerWidget({
  type,
  reason,
  onSendDirect,
  isProcessing
}: EscalationBannerWidgetProps) {
  const [directReply, setDirectReply] = React.useState("");
  
  const config = {
    escalated_info: {
      color: "bg-(--color-warning-50)",
      borderColor: "border-(--color-warning-200)",
      icon: <Info className="h-5 w-5 text-(--color-warning-600)" />,
      title: "Falta información",
      textColor: "text-(--color-warning-800)",
    },
    escalated_sensitive: {
      color: "bg-(--color-warning-50)",
      borderColor: "border-(--color-warning-300)",
      icon: <AlertTriangle className="h-5 w-5 text-(--color-warning-600)" />,
      title: "Requiere tu criterio",
      textColor: "text-(--color-warning-900)",
    },
    urgent: {
      color: "bg-(--color-error-50)",
      borderColor: "border-(--color-error-300)",
      icon: <AlertOctagon className="h-5 w-5 text-(--color-error-600)" />,
      title: "Atención Urgente",
      textColor: "text-(--color-error-900)",
    }
  };

  const current = config[type];

  const handleSend = () => {
    if (directReply.trim()) {
      onSendDirect(directReply);
      setDirectReply("");
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Banner */}
      <div className={cn("w-full border rounded-xl p-4 flex gap-3 animate-in fade-in", current.color, current.borderColor)}>
        <div className="shrink-0 mt-0.5">{current.icon}</div>
        <div className="flex flex-col">
          <span className={cn("text-sm font-bold", current.textColor)}>{current.title}</span>
          <p className="text-sm text-(--text-secondary) mt-1">{reason}</p>
        </div>
      </div>

      {/* Direct Reply Input */}
      <div className="w-full bg-white border border-(--surface-border-strong) rounded-full flex items-center p-1 shadow-sm focus-within:ring-2 focus-within:ring-(--color-primary-700) focus-within:border-transparent">
        <input 
          type="text"
          value={directReply}
          onChange={(e) => setDirectReply(e.target.value)}
          placeholder="Escribe tu respuesta directamente..."
          className="flex-1 bg-transparent border-none px-4 py-3 h-[48px] text-[15px] focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button 
          className="rounded-full h-10 w-10 p-0 shrink-0 ml-1"
          onClick={handleSend}
          disabled={!directReply.trim() || isProcessing}
          isLoading={isProcessing}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
