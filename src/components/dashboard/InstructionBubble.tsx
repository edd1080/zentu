"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

const SOURCE_ICON: Record<string, string> = {
  quick_instruct: "solar:keyboard-linear",
  text:           "solar:keyboard-linear",
  voice_note:     "solar:microphone-2-linear",
  image_ocr:      "solar:gallery-minimalistic-linear",
  pdf:            "solar:document-text-linear",
};

interface InstructionBubbleProps {
  content: string;
  topic?: string;
  source?: string;
  time: string;
  isOwner?: boolean; // true = user instruction (right), false = agent confirmation (left)
}

export function InstructionBubble({ content, topic, source, time, isOwner = true }: InstructionBubbleProps) {
  const iconName = SOURCE_ICON[source || "quick_instruct"] || "solar:keyboard-linear";

  if (isOwner) {
    return (
      <div className="flex justify-end gap-2 px-1">
        <div className="flex flex-col items-end gap-1 max-w-[85%]">
          <div className="bg-[#3DC185] text-white rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm leading-relaxed">{content}</p>
          </div>
          <div className="flex items-center gap-1.5 pr-1">
            <Icon name={iconName} size={10} className="text-slate-400" />
            <span className="text-[10px] text-slate-400 font-medium">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2 px-1">
      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-1">
        <Icon name="solar:stars-linear" size={12} className="text-emerald-600" />
      </div>
      <div className="flex flex-col gap-1 max-w-[85%]">
        <div className={cn("bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm")}>
          <p className="text-sm text-slate-700 leading-relaxed">
            Entendido.{topic ? ` Lo usaré para responder preguntas sobre ${topic}.` : " Lo he registrado correctamente."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 pl-1">
          <Icon name="solar:check-circle-linear" size={10} className="text-[#3DC185]" />
          <span className="text-[10px] text-slate-400 font-medium">{time}</span>
        </div>
      </div>
    </div>
  );
}
