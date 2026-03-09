"use client";

import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const ONBOARDING_STEPS = [
    { path: "/onboarding/industry", label: "Selección de industria" },
    { path: "/onboarding/knowledge", label: "Información del negocio" },
    { path: "/onboarding/escalation-rules", label: "Reglas de escalamiento" },
    { path: "/onboarding/whatsapp", label: "Conectar WhatsApp" },
    { path: "/onboarding/test", label: "Prueba técnica" }
];

export function OnboardingHeader() {
    const pathname = usePathname();
    const router = useRouter();

    // Find current step index
    const currentIndex = ONBOARDING_STEPS.findIndex(step => pathname.includes(step.path));

    // If not found (e.g., in base /onboarding), don't show the header or show loading
    if (currentIndex === -1) return null;

    const currentStepNum = currentIndex + 1;
    const totalSteps = ONBOARDING_STEPS.length;
    const progressPercent = (currentStepNum / totalSteps) * 100;

    return (
        <header className="sticky top-0 z-50 w-full bg-[#FAFAFA] border-b border-[#E5E5E5] h-14 flex items-center px-4 justify-between">
            <div className="flex items-center gap-3 w-1/3">
                {currentIndex > 0 && (
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 text-zinc-500 hover:text-zinc-900 transition-colors rounded-full"
                        aria-label="Regresar"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="flex flex-col items-center justify-center w-1/3 gap-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                    Paso {currentStepNum} de {totalSteps}
                </span>
                <div className="w-24 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="w-1/3" /> {/* Spacer for centering */}
        </header>
    );
}
