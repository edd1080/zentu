"use client";

import * as React from "react";

type DaySchedule = { open: string; close: string; closed?: boolean };
type Schedule = Record<string, DaySchedule>;

interface ScheduleEditorProps {
  schedule: Schedule | null;
  editing: boolean;
  onChange: (schedule: Schedule) => void;
}

const DAYS = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miércoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

export function ScheduleEditor({ schedule, editing, onChange }: ScheduleEditorProps) {
  function setDay(day: string, field: string, value: string | boolean) {
    const existing = schedule?.[day] || { open: "08:00", close: "18:00" };
    onChange({ ...(schedule || {}), [day]: { ...existing, [field]: value } });
  }

  return (
    <div className="bg-white border border-(--surface-border) rounded-xl overflow-hidden">
      {DAYS.map(({ key, label }) => {
        const day = schedule?.[key];
        return (
          <div key={key} className="px-4 py-3 border-b border-(--surface-border) last:border-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-(--text-primary) w-24">{label}</p>
              {editing ? (
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <label className="flex items-center gap-1.5 text-xs text-(--text-secondary)">
                    <input
                      type="checkbox"
                      checked={!!day?.closed}
                      onChange={e => setDay(key, "closed", e.target.checked)}
                      className="h-3.5 w-3.5"
                    />
                    Cerrado
                  </label>
                  {!day?.closed && (
                    <>
                      <input type="time" className="text-xs border border-(--surface-border) rounded px-1.5 py-1 text-(--text-primary)"
                        value={day?.open || "08:00"} onChange={e => setDay(key, "open", e.target.value)} />
                      <span className="text-xs text-(--text-tertiary)">–</span>
                      <input type="time" className="text-xs border border-(--surface-border) rounded px-1.5 py-1 text-(--text-primary)"
                        value={day?.close || "18:00"} onChange={e => setDay(key, "close", e.target.value)} />
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-(--text-secondary)">
                  {!day || day.closed
                    ? <span className="text-(--text-tertiary) italic">Cerrado</span>
                    : `${day.open} – ${day.close}`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
