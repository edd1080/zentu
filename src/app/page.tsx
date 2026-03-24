"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Step1, Step2, Step3 } from "./_components/SplashSteps";

const STEP_COMPONENTS = [<Step1 key={0} />, <Step2 key={1} />, <Step3 key={2} />];

export default function SplashPage() {
  const [step, setStep] = React.useState(0);
  const isLast = step === 2;

  return (
    <div className="fixed inset-0 bg-[#FCFDFD] flex flex-col md:justify-center items-center md:p-5 overflow-y-auto overflow-x-hidden">
      {/* Background blurs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#3DC185]/5 to-yellow-100/10 rounded-full blur-3xl opacity-80 translate-x-1/4 translate-y-1/4" />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-transparent to-[#3DC185]/5 rounded-full blur-3xl opacity-60 -translate-x-1/4 -translate-y-1/4" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full h-full md:h-[760px] md:max-w-[420px] bg-white md:rounded-[2.5rem] md:shadow-[0_8px_40px_rgba(0,0,0,0.06)] md:border border-slate-100 flex flex-col overflow-hidden">

        {/* Steps area */}
        <div className="flex-1 relative">
          {STEP_COMPONENTS[step]}
        </div>

        {/* Bottom controls */}
        <div className="bg-white px-8 pb-10 pt-2 flex flex-col items-center w-full shrink-0 relative z-30">
          {/* Dots */}
          <div className="flex gap-2 mb-8">
            {[0, 1, 2].map(i => (
              <div key={i} onClick={() => setStep(i)} className={cn(
                "rounded-full transition-all duration-300 cursor-pointer",
                i === step ? "w-5 h-1.5 bg-[#3DC185]" : "w-1.5 h-1.5 bg-slate-200"
              )} />
            ))}
          </div>

          <div className="w-full space-y-3">
            {isLast ? (
              <Link href="/register" className="h-12 bg-[#3DC185] hover:bg-[#32a873] transition-all active:scale-[0.98] flex text-sm font-semibold text-white w-full rounded-xl shadow-sm items-center justify-center">
                Crear cuenta
              </Link>
            ) : (
              <button onClick={() => setStep(s => s + 1)} className="h-12 bg-[#3DC185] hover:bg-[#32a873] transition-all active:scale-[0.98] flex text-sm font-semibold text-white w-full rounded-xl shadow-sm items-center justify-center">
                Siguiente
              </button>
            )}
            {isLast ? (
              <Link href="/login" className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center">
                Ya tengo cuenta, ingresar
              </Link>
            ) : (
              <button onClick={() => setStep(2)} className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] flex items-center justify-center">
                Omitir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
