"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Scissors, Stethoscope, Store, Dumbbell, Briefcase, HelpCircle, Loader2 } from "lucide-react";
import { IndustryCard } from "@/components/onboarding/industry-card";
import { TopicChip } from "@/components/onboarding/topic-chip";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";

const INDUSTRIES = [
    { id: "restaurant", name: "Restaurante / Café", icon: Coffee, preview: ["Horarios", "Menú", "Ubicación", "Reservas"] },
    { id: "clinic", name: "Clínica / Salud", icon: Stethoscope, preview: ["Citas", "Servicios médicos", "Cobertura", "Ubicación"] },
    { id: "salon", name: "Estética / Salón", icon: Scissors, preview: ["Agendar Cita", "Precios", "Ubicación", "Servicios"] },
    { id: "retail", name: "Tienda Física", icon: Store, preview: ["Inventario", "Horarios", "Ubicación", "Devoluciones"] },
    { id: "gym", name: "Gimnasio", icon: Dumbbell, preview: ["Membresías", "Horarios", "Clases grupales", "Entrenadores"] },
    { id: "professional_services", name: "Servicios", icon: Briefcase, preview: ["Cotizaciones", "Servicios", "Contacto"] },
    { id: "other", name: "Otro", icon: HelpCircle, preview: ["Información del negocio", "Ventas", "Atención al cliente"] },
];

export default function IndustryPage() {
    const router = useRouter();
    const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const activePreview = useMemo(() => {
        return INDUSTRIES.find(i => i.id === selectedIndustry)?.preview || [];
    }, [selectedIndustry]);

    async function handleContinue() {
        if (!selectedIndustry || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const res = await fetch("/api/onboarding/industry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ industry: selectedIndustry })
            });

            if (!res.ok) throw new Error("API Error");

            // Advance to knowledge block
            router.push("/onboarding/knowledge");
        } catch (err) {
            console.error(err);
            alert("Hubo un error guardando la industria.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <OnboardingHeader />

            <div className="flex flex-col gap-6 p-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                        ¿Cuál es el giro de tu negocio?
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Esto nos ayuda a pre-cargarle a tu agente los temas que más le preguntan a negocios como el tuyo.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {INDUSTRIES.map((ind) => (
                        <IndustryCard
                            key={ind.id}
                            id={ind.id}
                            name={ind.name}
                            icon={ind.icon}
                            selected={selectedIndustry === ind.id}
                            onClick={() => setSelectedIndustry(ind.id)}
                        />
                    ))}
                </div>

                {/* Dynamic Preview Area */}
                <div className="min-h-[100px] bg-zinc-50 rounded-xl p-4 border border-zinc-100 mt-2 transition-all">
                    <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">
                        {selectedIndustry ? "Tu agente vendrá preparado para hablar de:" : "Selecciona una opción para ver un avance"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {activePreview.map((topic, i) => (
                            <div key={topic} style={{ animationDelay: `${i * 100}ms` }}>
                                <TopicChip name={topic} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Button Sticky to bottom on mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-transparent sm:px-0">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedIndustry || isSubmitting}
                        className="w-full flex items-center justify-center py-4 px-6 rounded-full bg-zinc-900 text-white font-medium shadow-sm transition-all focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Aceptar y continuar"}
                    </button>
                </div>
            </div>
        </>
    );
}
