"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface CompletenessBarProps {
    fields: {
        name: string;
        description: string;
        address: string;
        schedule: any;
        services: string;
        tone: string;
    };
}

export function CompletenessBar({ fields }: CompletenessBarProps) {
    const completeness = useMemo(() => {
        let score = 0;
        if (fields.name?.length > 2) score += 16.6;
        if (fields.description?.length > 5) score += 16.6;
        if (fields.address?.length > 5) score += 16.6;

        // Check if schedule is not empty or default
        if (fields.schedule && Object.keys(fields.schedule).length > 0) score += 16.6;

        if (fields.services?.length > 10) score += 16.6;
        if (fields.tone) score += 17.0; // Last one gives 17 to reach 100
        return Math.min(100, Math.round(score));
    }, [fields]);

    return (
        <div className="fixed top-14 left-0 right-0 z-40 bg-zinc-50 border-b border-zinc-200 px-4 py-2 shadow-sm flex items-center gap-3">
            <div className="flex-1 max-w-lg mx-auto flex items-center gap-3">
                <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            completeness === 100 ? "bg-[#3DC185]" : "bg-zinc-600"
                        )}
                        style={{ width: `${completeness}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-zinc-700 w-10 text-right">
                    {completeness}%
                </span>
            </div>
        </div>
    );
}
