"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface IndustryCardProps {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export function IndustryCard({ name, icon, selected, onClick }: IndustryCardProps) {
  return (
    <button onClick={onClick} aria-pressed={selected}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-xl border transition-all bg-white text-center group",
        selected
          ? "border-[#3DC185] ring-4 ring-[#3DC185]/10 bg-[#3DC185]/5 shadow-sm text-[#3DC185]"
          : "border-zinc-200 hover:border-[#3DC185] hover:bg-[#3DC185]/5 text-zinc-600 hover:text-[#3DC185]"
      )}>
      <Icon name={icon} size={28} className="mb-2 transition-transform group-active:scale-95" />
      <span className={cn("text-xs font-medium", selected ? "text-slate-900" : "text-zinc-800")}>{name}</span>
    </button>
  );
}
