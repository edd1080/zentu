import { cn } from "@/lib/utils";
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
  onQuickApprove?: (id: string) => void;
  isQuickApproving?: boolean;
}

function getInitials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const badgeMap: Record<string, { label: string; cls: string }> = {
  urgent: { label: "Urgente", cls: "text-rose-600 bg-rose-50 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" },
  escalated_sensitive: { label: "Sensible", cls: "text-amber-600 bg-amber-50 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" },
  escalated_info: { label: "Informativo", cls: "text-blue-600 bg-blue-50 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" },
  pending_approval: { label: "Sugerencia lista", cls: "text-emerald-600 bg-emerald-50 border border-emerald-100/50 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded" },
};

const avatarMap: Record<string, string> = {
  urgent: "bg-rose-50 border-rose-100 text-rose-600",
  escalated_sensitive: "bg-amber-50 border-amber-100 text-amber-600",
  escalated_info: "bg-blue-50 border-blue-100 text-blue-600",
  pending_approval: "bg-[#3DC185]/10 border-[#3DC185]/20 text-[#3DC185]",
  none: "bg-slate-100 border-slate-200 text-slate-600",
};

export function ConversationItem({ id, clientName, lastMessageSnippet, timeAgo, actionRequired }: ConversationItemProps) {
  const badge = badgeMap[actionRequired];
  const isPending = actionRequired === "pending_approval";
  const isUrgent = actionRequired === "urgent";
  const timeClass = isUrgent ? "text-rose-600" : isPending ? "text-emerald-600" : "text-slate-400";

  return (
    <Link
      href={`/dashboard/conversations/${id}`}
      className={cn(
        "block px-4 py-3.5 border-b border-slate-50 transition-colors relative",
        isUrgent ? "hover:bg-slate-50/50 border-l-2 border-l-rose-500 bg-white" : "hover:bg-slate-50/50 bg-white",
        isPending && "bg-[#F8FAFC]",
      )}
    >
      {isPending && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-r-full" />
      )}
      <div className="flex gap-3 items-start">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 border",
          avatarMap[actionRequired] ?? avatarMap.none
        )}>
          {getInitials(clientName)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <span className={cn("text-sm truncate", isPending ? "font-semibold text-slate-900" : "font-medium text-slate-900")}>
              {clientName}
            </span>
            <span className={cn("text-xs font-medium shrink-0 ml-2", timeClass)}>{timeAgo}</span>
          </div>
          {badge && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className={badge.cls}>{badge.label}</span>
            </div>
          )}
          <p className="text-sm text-slate-500 truncate">{lastMessageSnippet}</p>
        </div>
      </div>
    </Link>
  );
}
