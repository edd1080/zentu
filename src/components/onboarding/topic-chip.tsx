"use client";

import { cn } from "@/lib/utils";

interface TopicChipProps {
    name: string;
    description?: string;
    animateIn?: boolean;
}

export function TopicChip({ name, description, animateIn = true }: TopicChipProps) {
    return (
        <div
            className={cn(
                "inline-flex flex-col px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200",
                animateIn && "animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both"
            )}
        >
            <span className="text-xs font-semibold text-emerald-800">{name}</span>
        </div>
    );
}
