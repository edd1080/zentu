import * as React from "react";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export type MessageSenderType = "client" | "agent" | "owner";

export interface MessageBubbleProps {
  id: string;
  sender: MessageSenderType;
  content: string;
  time: string;
  clientName?: string;
  isInitialContext?: boolean; 
}

export function MessageBubble({ 
  sender,
  content,
  time,
  clientName,
  isInitialContext 
}: MessageBubbleProps) {
  
  const isRight = sender === "agent" || sender === "owner";

  if (isInitialContext) {
    return (
      <div className="w-full flex justify-center py-4">
        <span className="text-xs font-semibold px-3 py-1 bg-(--surface-muted) text-(--text-tertiary) uppercase tracking-wider rounded-full">
          {content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full mt-4", isRight ? "justify-end pl-12" : "justify-start pr-12")}>
      <div className={cn("flex max-w-[85%] items-end gap-2", isRight ? "flex-row-reverse" : "flex-row")}>
        
        {/* Avatar */}
        <div className="shrink-0 mb-1">
          {sender === "client" && (
            <Avatar name={clientName || "Cliente"} size="sm" />
          )}
          {sender === "agent" && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary-100) text-(--color-primary-700)">
              <Bot className="h-4 w-4" />
            </div>
          )}
          {sender === "owner" && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--surface-border-strong) text-white">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Bubble */}
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "px-4 py-3 rounded-2xl relative shadow-sm",
              sender === "client" && "bg-(--surface-card) border border-(--surface-border) text-(--text-primary) rounded-bl-sm",
              sender === "agent" && "bg-(--color-primary-50) border border-(--color-primary-100) text-(--color-primary-900) rounded-br-sm",
              sender === "owner" && "bg-(--color-primary-700) text-white rounded-br-sm shadow-md"
            )}
            style={{ wordBreak: "break-word" }}
          >
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-ui">{content}</p>
          </div>
          
          <span className={cn(
            "text-[11px] font-medium text-(--text-tertiary)",
            isRight ? "text-right" : "text-left"
          )}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
