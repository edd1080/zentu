"use client";

import { cn } from "@/lib/utils";

interface TopicChipProps {
    name: string;
    description?: string;
    animateIn?: boolean;
}

export function TopicChip({ name, animateIn = true }: TopicChipProps) {
    return (
        <div
            className={cn(
                "inline-flex flex-col px-3 py-1.5 rounded-full bg-[#3DC185]/10 border border-[#3DC185]/20",
                animateIn && "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            )}
        >
            <span className="text-xs font-semibold text-[#3DC185]">{name}</span>
        </div>
    );
}
