"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const STEPS = [
  "/onboarding/industry",
  "/onboarding/knowledge",
  "/onboarding/escalation-rules",
  "/onboarding/whatsapp",
  "/onboarding/sandbox",
];

export function OnboardingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = STEPS.findIndex(s => pathname.includes(s));
  if (currentIndex === -1) return null;

  const stepNum = currentIndex + 1;
  const total = STEPS.length;
  const pct = (stepNum / total) * 100;

  return (
    <header className="sticky top-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-zinc-200/50 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {currentIndex > 0 && (
            <button onClick={() => router.back()} className="text-zinc-400 hover:text-zinc-800 transition-colors p-1 -ml-1 rounded-lg">
              <Icon name="solar:alt-arrow-left-linear" size={20} />
            </button>
          )}
          <span className="text-xl font-semibold text-zinc-800 tracking-tight">Paso {stepNum} de {total}</span>
        </div>
      </div>
      <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
        <div className="bg-[#3DC185] h-1.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}
