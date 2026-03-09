"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const DAYS = [
    { id: "monday", label: "Lunes", short: "Lun" },
    { id: "tuesday", label: "Martes", short: "Mar" },
    { id: "wednesday", label: "Miércoles", short: "Mié" },
    { id: "thursday", label: "Jueves", short: "Jue" },
    { id: "friday", label: "Viernes", short: "Vie" },
    { id: "saturday", label: "Sábado", short: "Sáb" },
    { id: "sunday", label: "Domingo", short: "Dom" },
];

interface ScheduleEditorProps {
    value: any;
    onChange: (schedule: any) => void;
}

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
    // Use a local state for simpler toggling, but emit onChange
    const [schedule, setSchedule] = useState(value || {});

    const updateDay = (dayId: string, updates: any) => {
        const currentDay = schedule[dayId] || { active: true, open: "09:00", close: "18:00" };
        const newSchedule = {
            ...schedule,
            [dayId]: { ...currentDay, ...updates }
        };
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    const toggleDay = (dayId: string) => {
        const currentDay = schedule[dayId] || { active: false, open: "09:00", close: "18:00" };
        const newSchedule = {
            ...schedule,
            [dayId]: { ...currentDay, active: !currentDay.active }
        };
        setSchedule(newSchedule);
        onChange(newSchedule);
    };

    return (
        <div className="flex flex-col gap-2">
            {DAYS.map((day) => {
                const data = schedule[day.id] || { active: false, open: "09:00", close: "18:00" };

                return (
                    <div key={day.id} className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-lg">
                        <button
                            onClick={() => toggleDay(day.id)}
                            className={cn(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2",
                                data.active ? "bg-emerald-500" : "bg-zinc-200"
                            )}
                            aria-pressed={data.active}
                        >
                            <span className={cn(
                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                data.active ? "translate-x-2" : "-translate-x-2"
                            )} />
                        </button>
                        <span className="w-10 font-medium text-sm text-zinc-700">{day.short}</span>

                        {data.active ? (
                            <div className="flex items-center gap-2 flex-1">
                                <input
                                    type="time"
                                    value={data.open}
                                    onChange={(e) => updateDay(day.id, { open: e.target.value })}
                                    className="px-2 py-1 text-sm bg-zinc-50 border border-zinc-200 rounded text-center w-full"
                                />
                                <span className="text-zinc-400 text-xs">a</span>
                                <input
                                    type="time"
                                    value={data.close}
                                    onChange={(e) => updateDay(day.id, { close: e.target.value })}
                                    className="px-2 py-1 text-sm bg-zinc-50 border border-zinc-200 rounded text-center w-full"
                                />
                            </div>
                        ) : (
                            <div className="flex-1 text-zinc-400 text-sm italic py-1">
                                Cerrado
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
}
