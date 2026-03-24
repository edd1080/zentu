"use client";

import { cn } from "@/lib/utils";

type DaySchedule = { open: string; close: string; closed?: boolean };
type Schedule = Record<string, DaySchedule>;
interface ScheduleEditorProps { schedule: Schedule | null; editing: boolean; onChange: (schedule: Schedule) => void; }

const DAYS = [
  { key: "mon", label: "Lunes" }, { key: "tue", label: "Martes" }, { key: "wed", label: "Miércoles" },
  { key: "thu", label: "Jueves" }, { key: "fri", label: "Viernes" }, { key: "sat", label: "Sábado" }, { key: "sun", label: "Domingo" },
];

export function ScheduleEditor({ schedule, editing, onChange }: ScheduleEditorProps) {
  function setDay(day: string, field: string, value: string | boolean) {
    const existing = schedule?.[day] || { open: "08:00", close: "18:00" };
    onChange({ ...(schedule || {}), [day]: { ...existing, [field]: value } });
  }

  return (
    <div>
      {DAYS.map(({ key, label }, i) => {
        const day = schedule?.[key];
        const closed = !day || day.closed;
        return (
          <div key={key} className={cn("flex items-center justify-between py-3", i < DAYS.length - 1 && "border-b border-slate-100/80")}>
            <span className="w-24 text-sm font-medium text-slate-900 shrink-0">{label}</span>
            <div className="flex-1 flex items-center justify-end gap-4">
              <label className={cn(
                "relative flex items-center gap-2",
                editing ? "cursor-pointer" : "pointer-events-none opacity-60"
              )}>
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!closed}
                    onChange={e => editing && setDay(key, "closed", e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:bg-[#3DC185] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 peer-checked:after:border-white" />
                </div>
                <span className="text-xs text-slate-500 font-medium hidden sm:block">Cerrado</span>
              </label>
              <div className={cn("flex items-center gap-1.5 transition-opacity", closed && "opacity-30 pointer-events-none")}>
                <input
                  type="time"
                  disabled={!editing || !!closed}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-1 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-[#3DC185] w-[76px] text-center disabled:opacity-100"
                  value={day?.open || "08:00"}
                  onChange={e => setDay(key, "open", e.target.value)}
                />
                <span className="text-slate-400 text-sm">–</span>
                <input
                  type="time"
                  disabled={!editing || !!closed}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-1 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-[#3DC185] w-[76px] text-center disabled:opacity-100"
                  value={day?.close || "18:00"}
                  onChange={e => setDay(key, "close", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
