"use client";

import { useMemo } from "react";

interface HomeGreetingProps {
  businessName: string;
}

function initials(name: string) {
  return (name || "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export function HomeGreeting({ businessName }: HomeGreetingProps) {
  const { dayLabel, dateLabel, greeting } = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const greeting = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
    const dayLabel = now.toLocaleDateString("es-GT", { weekday: "long" }).toUpperCase();
    const dateLabel = now.toLocaleDateString("es-GT", { day: "numeric", month: "short" }).toUpperCase();
    return { dayLabel, dateLabel, greeting };
  }, []);

  return (
    <div className="flex items-center justify-between pt-6 pb-5">
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
          {dayLabel}, {dateLabel}
        </p>
        <h1 className="mt-2 text-[26px] font-bold text-slate-900 leading-tight tracking-tight">
          {greeting},
        </h1>
        <p className="text-[22px] font-semibold text-[#3DC185] leading-tight">
          {businessName}
        </p>
      </div>

      <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-100/80 flex items-center justify-center text-[#3DC185] text-xl font-bold shrink-0 shadow-sm select-none">
        {initials(businessName)}
      </div>
    </div>
  );
}
