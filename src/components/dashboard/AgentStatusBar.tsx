"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AlertOctagon, BookOpen, WifiOff } from "lucide-react";

export type AgentStatusType = "active" | "pending" | "learning_needed" | "urgent" | "disconnected";

interface AgentStatusBarProps {
  status: AgentStatusType;
  stats?: {
    handledToday?: number;
    pendingCount?: number;
    missingTopicsCount?: number;
  };
  urgentContext?: {
    clientName: string;
    description: string;
    conversationId: string;
  };
  className?: string;
}

export function AgentStatusBar({ status, stats, urgentContext, className }: AgentStatusBarProps) {
  // Urgent State - Completely replaces the normal bar
  if (status === "urgent" && urgentContext) {
    return (
      <div className={cn("w-full bg-(--color-error-50) border-l-[3px] border-(--color-error-700) p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm", className)}>
        <div className="flex items-start gap-3">
          <AlertOctagon className="h-5 w-5 text-(--color-error-700) shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-(--color-error-700)">Situación urgente: {urgentContext.clientName}</span>
            <span className="text-sm text-(--color-error-600) line-clamp-1">{urgentContext.description}</span>
          </div>
        </div>
        <Link 
          href={`/dashboard/conversations/${urgentContext.conversationId}`}
          className="inline-flex items-center justify-center rounded-md bg-(--color-error-600) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-error-700) transition-colors whitespace-nowrap"
        >
          Atender ahora
        </Link>
      </div>
    );
  }

  // Normal States
  const config = {
    active: {
      color: "bg-(--color-success-500)",
      pulse: true,
      text: `Tu agente está activo. Atendió ${stats?.handledToday || 0} conversaciones hoy.`,
      icon: null,
      href: null,
      actionText: null,
    },
    pending: {
      color: "bg-(--color-warning-500)",
      pulse: false,
      text: `Hay ${stats?.pendingCount || 0} respuestas esperando tu aprobación.`,
      icon: null,
      href: "/dashboard/conversations?filter=pending",
      actionText: null,
    },
    learning_needed: {
      color: "bg-(--color-warning-500)",
      pulse: false,
      text: `A tu agente le falta información en ${stats?.missingTopicsCount || 0} temas.`,
      icon: <BookOpen className="h-4 w-4 text-(--text-primary) mr-1.5 inline-block -mt-0.5" />,
      href: "/dashboard/agent",
      actionText: null,
    },
    disconnected: {
      color: "bg-(--color-error-500)",
      pulse: false,
      text: "Tu agente está desconectado.",
      icon: <WifiOff className="h-4 w-4 text-(--text-primary) mr-1.5 inline-block -mt-0.5" />,
      href: "#", // Flow to reconnect WhatsApp
      actionText: "Reconectar",
    }
  };

  const currentConfig = config[status as Exclude<AgentStatusType, "urgent">];

  const content = (
    <div className={cn("w-full px-4 py-3 flex items-center justify-between border-b border-(--surface-border) bg-(--surface-card)", className)}>
      <div className="flex items-center">
        <div className="relative flex h-3 w-3 mr-3 mt-0.5">
          {currentConfig.pulse && (
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", currentConfig.color)}></span>
          )}
          <span className={cn("relative inline-flex rounded-full h-3 w-3", currentConfig.color)}></span>
        </div>
        <div className="text-sm font-medium text-(--text-primary)">
          {currentConfig.icon}
          {currentConfig.text}
        </div>
      </div>
      
      {currentConfig.actionText && (
        <button className="text-sm font-semibold text-(--color-error-700) hover:underline pl-3">
          {currentConfig.actionText}
        </button>
      )}
    </div>
  );

  if (currentConfig.href) {
    return (
      <Link href={currentConfig.href} className="block w-full hover:bg-(--surface-muted) transition-colors">
        {content}
      </Link>
    );
  }

  return content;
}
