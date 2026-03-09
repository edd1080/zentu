"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Briefcase } from "lucide-react";
import { CompletenessBar } from "./completeness-bar";
import { ScheduleEditor } from "./schedule-editor";
import { ServiceEditor } from "./service-editor";
import { ToneSelector } from "./tone-selector";

const INDUSTRY_LABELS: Record<string, string> = {
    restaurant: "Restaurante / Café",
    clinic: "Clínica / Salud",
    salon: "Salón / Spa",
    retail: "Tienda / Retail",
    gym: "Gimnasio / Fitness",
    professional_services: "Servicios Profesionales",
    other: "Otro Negocio"
};

export function M13KnowledgeCapture({ initialIndustry = "other" }: { initialIndustry?: string }) {
    const router = useRouter();

    const [fields, setFields] = useState({
        name: "",
        description: "",
        address: "",
        schedule: null as any,
        services: "",
        tone: ""
    });

    // State for progressive blocks: 1, 2, 3, 4
    const [activeBlock, setActiveBlock] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (key: keyof typeof fields, val: any) => {
        setFields(prev => ({ ...prev, [key]: val }));
    };

    const nextBlock = () => {
        setActiveBlock(p => {
            const next = Math.min(p + 1, 4);
            setTimeout(() => {
                document.getElementById(`block-${next}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
            return next;
        });
    };

    const handleFinish = async () => {
        if (!fields.name || !fields.services) return; // Minimal requirements

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/onboarding/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(fields)
            });

            if (!res.ok) throw new Error("API Error");

            router.push("/onboarding/escalation-rules");
        } catch (err) {
            console.error(err);
            alert("No se pudo guardar la información.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative pb-32">
            <CompletenessBar fields={fields} />

            <div className="pt-24 px-4 flex flex-col gap-8">

                {/* BLOCK 1: Essentials */}
                <section id="block-1" className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-100">
                            <Briefcase className="w-3.5 h-3.5" />
                            {INDUSTRY_LABELS[initialIndustry] || INDUSTRY_LABELS.other}
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-1">Lo Básico</h2>
                        <p className="text-sm text-zinc-500">¿Cómo debe el agente presentar tu negocio?</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <input
                            type="text"
                            placeholder="Nombre del negocio *"
                            value={fields.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-shadow"
                        />
                        <textarea
                            placeholder="Descripción corta (ej. El mejor lugar para comer pizzas al horno)"
                            value={fields.description}
                            onChange={(e) => updateField("description", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm min-h-[80px] focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 resize-none transition-shadow"
                        />
                        <input
                            type="text"
                            placeholder="Dirección o área de servicio"
                            value={fields.address}
                            onChange={(e) => updateField("address", e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-shadow"
                        />
                    </div>

                    {activeBlock === 1 && (
                        <button
                            onClick={nextBlock}
                            disabled={!fields.name}
                            className="w-full mt-2 py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-transform active:scale-[0.98] hover:bg-zinc-800"
                        >
                            Continuar a horarios
                        </button>
                    )}
                </section>

                {/* BLOCK 2: Schedule */}
                {activeBlock >= 2 && (
                    <section id="block-2" className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 border-t border-zinc-100">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-1">Horarios</h2>
                            <p className="text-sm text-zinc-500">¿En qué horas atiendes?</p>
                        </div>

                        <ScheduleEditor
                            value={fields.schedule}
                            onChange={(val) => updateField("schedule", val)}
                        />

                        {activeBlock === 2 && (
                            <button
                                onClick={nextBlock}
                                className="w-full mt-2 py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold transition-transform active:scale-[0.98] hover:bg-zinc-800"
                            >
                                Continuar a servicios
                            </button>
                        )}
                    </section>
                )}

                {/* BLOCK 3: Services & Pricing */}
                {activeBlock >= 3 && (
                    <section id="block-3" className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 border-t border-zinc-100">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-1">Servicios y Precios</h2>
                            <p className="text-sm text-zinc-500">Escribe natural, dicta por voz, o extrae de un link web.*</p>
                        </div>

                        <ServiceEditor
                            value={fields.services}
                            onChange={(val) => updateField("services", val)}
                        />

                        {activeBlock === 3 && (
                            <button
                                onClick={nextBlock}
                                disabled={!fields.services}
                                className="w-full mt-2 py-3.5 bg-zinc-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-transform active:scale-[0.98] hover:bg-zinc-800"
                            >
                                Continuar a estilo
                            </button>
                        )}
                    </section>
                )}

                {/* BLOCK 4: Tone */}
                {activeBlock >= 4 && (
                    <section id="block-4" className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-6 border-t border-zinc-100">
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 mb-1">Estilo y Tono</h2>
                            <p className="text-sm text-zinc-500">¿Cómo debería hablar tu agente?</p>
                        </div>

                        <ToneSelector
                            value={fields.tone}
                            onChange={(val) => updateField("tone", val)}
                        />
                    </section>
                )}
            </div>

            {/* Floating Action Button for Submit (Sticky at the bottom) */}
            {activeBlock === 4 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-transparent sm:px-4 sm:pt-10">
                    <div className="max-w-lg mx-auto w-full">
                        <button
                            onClick={handleFinish}
                            disabled={isSubmitting || !fields.name || !fields.services || !fields.tone}
                            className="w-full flex items-center justify-center py-4 px-6 rounded-full bg-emerald-600 text-white font-medium shadow-sm transition-all focus:ring-4 focus:ring-emerald-600/20 disabled:opacity-50 hover:bg-emerald-700 active:scale-[0.98]"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Completar Configuración"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
