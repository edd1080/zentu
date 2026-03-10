"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, BadgeInfo, AlertTriangle } from "lucide-react";

type Rule = {
    id: string;
    description: string;
    escalation_level: "informative" | "sensitive" | "urgent" | "none";
    active: boolean;
    trigger_type: string;
    keywords: string[];
};

export function M14EscalationRules() {
    const router = useRouter();
    const [rules, setRules] = useState<Rule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await fetch("/api/onboarding/escalation-rules");
                const data = await res.json();
                if (data.success) {
                    setRules(data.rules || []);
                }
            } catch (err) {
                console.error("Failed to fetch rules", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRules();
    }, []);

    const toggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/onboarding/escalation-rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rules })
            });

            if (!res.ok) throw new Error("API Error");

            // Proceed to the next step
            router.push("/onboarding/whatsapp");
        } catch (err) {
            console.error(err);
            alert("No se pudieron guardar las reglas.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIconForLevel = (level: string) => {
        switch (level) {
            case "informative": return <BadgeInfo className="w-5 h-5 text-blue-500" />;
            case "sensitive": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case "urgent": return <ShieldAlert className="w-5 h-5 text-red-500" />;
            default: return <BadgeInfo className="w-5 h-5 text-zinc-400" />;
        }
    };

    const getBgColorForLevel = (level: string) => {
        switch (level) {
            case "informative": return "bg-blue-50 border-blue-100";
            case "sensitive": return "bg-amber-50 border-amber-100";
            case "urgent": return "bg-red-50 border-red-100";
            default: return "bg-zinc-50 border-zinc-100";
        }
    };

    if (isLoading) {
        return (
            <div className="pt-32 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="relative pb-32">
            <div className="pt-24 px-4 flex flex-col gap-6 max-w-lg mx-auto">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">Reglas de Escalamiento</h1>
                    <p className="text-sm text-zinc-500">
                        Hemos precargado las reglas más comunes para tu industria. Indica qué temas prefieres atender tú personalmente.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {rules.map(rule => (
                        <div
                            key={rule.id}
                            className={`p-4 rounded-xl border flex gap-4 transition-colors cursor-pointer ${rule.active ? getBgColorForLevel(rule.escalation_level) : "bg-white border-zinc-200"}`}
                            onClick={() => toggleRule(rule.id)}
                        >
                            <div className="shrink-0 pt-1">
                                {getIconForLevel(rule.escalation_level)}
                            </div>
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${rule.active ? "text-zinc-900" : "text-zinc-600 line-through"}`}>
                                    {rule.description}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1 capitalize">
                                    Nivel: {rule.escalation_level === "informative" ? "Informativo" : rule.escalation_level === "sensitive" ? "Sensible" : "Urgente"}
                                </p>
                            </div>
                            <div className="flex items-center">
                                {/* Simple Checkbox / Switch simulation */}
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${rule.active ? "bg-emerald-500" : "bg-zinc-300"}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${rule.active ? "translate-x-4" : "translate-x-0"}`} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {rules.length === 0 && (
                        <div className="p-8 text-center bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-500 text-sm">
                            No se encontraron reglas precargadas.
                        </div>
                    )}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-transparent sm:px-4 sm:pt-10">
                <div className="max-w-lg mx-auto w-full">
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center py-4 px-6 rounded-full bg-zinc-900 text-white font-medium shadow-sm transition-all focus:ring-4 focus:ring-zinc-900/20 disabled:opacity-50 hover:bg-zinc-800 active:scale-[0.98]"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Recomendaciones"}
                    </button>
                    <p className="text-xs text-center text-zinc-400 mt-4">
                        Podrás editar esto más adelante.
                    </p>
                </div>
            </div>
        </div>
    );
}
