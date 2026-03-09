"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndustryCardProps {
    id: string;
    name: string;
    description?: string;
    icon: LucideIcon;
    selected: boolean;
    onClick: () => void;
}

export function IndustryCard({ id, name, description, icon: Icon, selected, onClick }: IndustryCardProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all bg-white text-center h-[120px]",
                selected
                    ? "border-emerald-500 ring-4 ring-emerald-50 bg-emerald-50/10 shadow-sm"
                    : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            )}
            aria-pressed={selected}
        >
            <Icon
                className={cn(
                    "w-8 h-8 mb-3",
                    selected ? "text-emerald-600" : "text-zinc-500"
                )}
            />
            <span className={cn(
                "text-sm font-semibold leading-tight",
                selected ? "text-emerald-900" : "text-zinc-900"
            )}>
                {name}
            </span>
            {description && (
                <span className="text-[10px] text-zinc-500 mt-1">{description}</span>
            )}
        </button>
    );
}
