"use client";

import { cn } from "@/lib/utils";

const TONES = [
    {
        id: "friendly",
        label: "Amigable y Cálido",
        emoji: "👋",
        example: "¡Hola! Qué gusto saludarte. Claro que sí, te ayudo con eso enseguida."
    },
    {
        id: "professional",
        label: "Profesional y Eficiente",
        emoji: "💼",
        example: "Buenos días. Entendido, proceso tu solicitud en este momento."
    },
    {
        id: "formal",
        label: "Muy Formal",
        emoji: "👔",
        example: "Estimado cliente, es un placer asistirle. Quedo a su entera disposición."
    }
];

interface ToneSelectorProps {
    value: string;
    onChange: (tone: string) => void;
}

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
    return (
        <div className="flex flex-col gap-3">
            {TONES.map((tone) => (
                <button
                    key={tone.id}
                    type="button"
                    onClick={() => onChange(tone.id)}
                    className={cn(
                        "flex flex-col text-left p-4 rounded-xl border-2 transition-all",
                        value === tone.id
                            ? "border-emerald-500 bg-emerald-50/20"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{tone.emoji}</span>
                        <span className={cn(
                            "font-semibold text-sm",
                            value === tone.id ? "text-emerald-900" : "text-zinc-900"
                        )}>
                            {tone.label}
                        </span>
                    </div>
                    <div className="text-sm text-zinc-600 italic bg-zinc-50/50 p-3 rounded-lg border border-zinc-100">
                        "{tone.example}"
                    </div>
                </button>
            ))}
        </div>
    );
}
