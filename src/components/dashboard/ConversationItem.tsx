import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { Clock, Check } from "lucide-react";
import Link from "next/link";

export type ConversationStatus = "active" | "resolved" | "archived" | "bot_handled";
export type ActionRequired = "none" | "pending_approval" | "escalated_info" | "escalated_sensitive" | "urgent";

export interface ConversationItemProps {
  id: string;
  clientName: string;
  lastMessageSnippet: string;
  timeAgo: string;
  status: ConversationStatus;
  actionRequired: ActionRequired;
  confidence?: "high" | "medium" | "low";
  onQuickApprove?: (id: string) => void;
  isQuickApproving?: boolean;
}

export function ConversationItem({
  id,
  clientName,
  lastMessageSnippet,
  timeAgo,
  status,
  actionRequired,
  confidence,
  onQuickApprove,
  isQuickApproving,
}: ConversationItemProps) {
  // Determine Tags based on actionRequired
  const renderBadge = () => {
    switch (actionRequired) {
      case "urgent":
        return <Badge variant="urgent">Urgente</Badge>;
      case "escalated_sensitive":
        return <Badge variant="warning">Requiere criterio</Badge>;
      case "escalated_info":
        return <Badge variant="warning">Falta contexto</Badge>;
      case "pending_approval":
        return <Badge variant="success">Sugerencia lista</Badge>;
      default:
        return null;
    }
  };

  const showQuickApprove = actionRequired === "pending_approval" && confidence === "high" && onQuickApprove;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-4 bg-(--surface-card) p-4 border-b border-(--surface-border) transition-all hover:bg-(--surface-muted)",
        isQuickApproving && "opacity-50 pointer-events-none translate-x-4",
        actionRequired === "urgent" && "border-l-[3px] border-l-(--color-error-500) bg-(--color-error-50)/30"
      )}
    >
      <Link href={`/dashboard/conversations/${id}`} className="absolute inset-0 z-0" aria-label={`Ver conversación con ${clientName}`} />
      
      <Avatar name={clientName} size="md" className="z-10" />

      <div className="flex-1 min-w-0 flex flex-col gap-1 z-10 pointer-events-none">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-(--text-primary) truncate pr-2">
            {clientName}
          </span>
          <span className="text-xs text-(--text-tertiary) whitespace-nowrap flex items-center gap-1">
            {actionRequired !== "none" ? <Clock className="h-3 w-3" /> : null}
            {timeAgo}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {renderBadge()}
          <span className="text-xs text-(--text-secondary) truncate">
            {lastMessageSnippet}
          </span>
        </div>
      </div>

      {showQuickApprove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onQuickApprove(id);
          }}
          disabled={isQuickApproving}
          className="z-20 shrink-0 ml-2 rounded-full bg-(--color-success-100) p-2 text-(--color-success-700) hover:bg-(--color-success-200) transition-colors"
          title="Aprobar rápidamente"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
