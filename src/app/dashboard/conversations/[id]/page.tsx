"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { MessageBubble } from "@/components/dashboard/MessageBubble";
import { ThreadHeader } from "@/components/dashboard/ThreadHeader";
import { ThreadActionBar } from "@/components/dashboard/ThreadActionBar";
import { useThreadData } from "./useThreadData";

export default function ConversationThreadPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const {
    messages, clientData,
    suggestionState, setSuggestionState,
    activeSuggestion, setActiveSuggestion,
    dismissedSuggestion, setDismissedSuggestion,
    activeEscalation, isProcessing,
    handleAction, handleConversationAction,
  } = useThreadData(id);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex w-full h-full flex-col bg-white relative overflow-hidden">
      <ThreadHeader
        clientName={clientData.name}
        phone={clientData.phone}
        onBack={() => router.push("/dashboard/conversations")}
        onResolve={() => handleConversationAction("resolve")}
        onArchive={() => handleConversationAction("archive")}
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-1 bg-slate-50/30 pb-[200px] sm:pb-[220px]">
        <div className="flex justify-center mb-6">
          <span className="text-[10px] font-medium text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-sm uppercase tracking-wider">
            Hoy
          </span>
        </div>
        {messages.map(m => (
          <MessageBubble key={m.id} id={m.id} sender={m.sender} content={m.content} time={m.time} clientName={clientData.name} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <ThreadActionBar
        suggestionState={suggestionState}
        activeSuggestion={activeSuggestion}
        activeEscalation={activeEscalation}
        dismissedSuggestion={dismissedSuggestion}
        isProcessing={isProcessing}
        onApprove={() => handleAction("approve")}
        onEdit={text => handleAction("edit", text)}
        onReject={() => handleAction("reject")}
        onAttend={() => handleAction("attend_escalation")}
        onSendDirect={text => handleAction("reply", text)}
        onRestoreDismissed={() => {
          setActiveSuggestion(dismissedSuggestion);
          setDismissedSuggestion(null);
          setSuggestionState("active");
        }}
      />
    </div>
  );
}
