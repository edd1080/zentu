import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export type MessageSenderType = "client" | "agent" | "owner";

export interface MessageBubbleProps {
  id: string;
  sender: MessageSenderType;
  content: string;
  time: string;
  clientName?: string;
  isInitialContext?: boolean;
}

function getInitials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

export function MessageBubble({ sender, content, time, clientName, isInitialContext }: MessageBubbleProps) {
  if (isInitialContext) {
    return (
      <div className="w-full flex justify-center py-4">
        <span className="text-[10px] font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-sm uppercase tracking-wider">
          {content}
        </span>
      </div>
    );
  }

  const isRight = sender === "agent" || sender === "owner";

  return (
    <div className={cn("flex items-end gap-2.5 mt-4", isRight ? "max-w-[85%] md:max-w-[70%] ml-auto flex-row-reverse" : "max-w-[85%] md:max-w-[70%]")}>
      {/* Avatar */}
      <div className="shrink-0 mb-1">
        {sender === "client" && (
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-500 border border-slate-200/60">
            {getInitials(clientName || "C")}
          </div>
        )}
        {sender === "owner" && (
          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-white shadow-sm">
            <Icon name="solar:user-rounded-linear" size={12} />
          </div>
        )}
        {sender === "agent" && (
          <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Icon name="solar:stars-linear" size={14} />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex flex-col gap-1", isRight ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl shadow-sm leading-relaxed",
            sender === "client" && "bg-white border border-slate-200 rounded-bl-sm text-sm text-slate-700",
            sender === "owner" && "bg-emerald-700 border border-emerald-800 rounded-br-sm text-sm text-white",
            sender === "agent" && "bg-emerald-50 border border-emerald-200/80 rounded-br-sm text-sm text-emerald-900"
          )}
          style={{ wordBreak: "break-word" }}
        >
          {content}
        </div>
        <span className={cn("text-[10px] font-medium text-slate-400", isRight ? "mr-1" : "ml-1")}>
          {time}{sender === "owner" ? " · Enviado por ti" : sender === "agent" ? " · Enviado por Agente" : ""}
        </span>
      </div>
    </div>
  );
}
