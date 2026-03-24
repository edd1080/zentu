"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IndustryCard } from "@/components/onboarding/industry-card";
import { TopicChip } from "@/components/onboarding/topic-chip";
import { OnboardingHeader } from "@/components/onboarding/onboarding-header";
import { Icon } from "@/components/ui/Icon";

const INDUSTRIES = [
  { id: "restaurant", name: "Restaurante / Café", icon: "solar:cup-linear", preview: ["Horarios", "Menú", "Ubicación", "Reservas"] },
  { id: "clinic", name: "Clínica / Salud", icon: "solar:heart-pulse-linear", preview: ["Citas", "Servicios médicos", "Cobertura", "Ubicación"] },
  { id: "salon", name: "Estética / Salón", icon: "solar:scissors-linear", preview: ["Agendar Cita", "Precios", "Ubicación", "Servicios"] },
  { id: "retail", name: "Tienda Física", icon: "solar:shop-linear", preview: ["Inventario", "Horarios", "Ubicación", "Devoluciones"] },
  { id: "gym", name: "Gimnasio", icon: "solar:dumbbell-linear", preview: ["Membresías", "Horarios", "Clases grupales", "Entrenadores"] },
  { id: "professional_services", name: "Servicios", icon: "solar:case-linear", preview: ["Cotizaciones", "Servicios", "Contacto"] },
  { id: "other", name: "Otro", icon: "solar:question-circle-linear", preview: ["Información del negocio", "Ventas", "Atención al cliente"] },
];

export default function IndustryPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const preview = useMemo(() => INDUSTRIES.find(i => i.id === selected)?.preview || [], [selected]);

  async function handleContinue() {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/industry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry: selected }),
      });
      if (!res.ok) throw new Error();
      router.push("/onboarding/knowledge");
    } catch {
      alert("Hubo un error guardando la industria.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <OnboardingHeader />
      <div className="flex flex-col gap-6 px-6 pt-8 pb-32">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">¿Cuál es el giro de tu negocio?</h1>
          <p className="text-sm text-zinc-500 leading-relaxed">Esto nos ayuda a pre-cargarle a tu agente los temas que más le preguntan a negocios como el tuyo.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {INDUSTRIES.map(ind => (
            <IndustryCard key={ind.id} id={ind.id} name={ind.name} icon={ind.icon}
              selected={selected === ind.id} onClick={() => setSelected(ind.id)} />
          ))}
        </div>

        <div className="bg-zinc-100/80 rounded-xl p-5 border border-zinc-200/60 min-h-[120px] flex flex-col justify-center transition-all">
          {selected ? (
            <>
              <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Tu agente vendrá preparado para hablar de:</p>
              <div className="flex flex-wrap gap-2">
                {preview.map((t, i) => <div key={t} style={{ animationDelay: `${i * 100}ms` }}><TopicChip name={t} /></div>)}
              </div>
            </>
          ) : (
            <p className="text-xs text-zinc-400 text-center font-medium">Selecciona una opción para ver un avance</p>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#FAFAFA]/90 backdrop-blur-md border-t border-zinc-200/60 z-50">
          <button onClick={handleContinue} disabled={!selected || submitting}
            className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
            {submitting ? <Icon name="solar:refresh-linear" size={16} className="animate-spin" /> : "Aceptar y continuar"}
          </button>
        </div>
      </div>
    </>
  );
}
