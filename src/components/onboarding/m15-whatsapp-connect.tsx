"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function M15WhatsappConnect() {
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isSkipping, setIsSkipping] = useState(false);

    const handleConnect = async (simulateSuccess: boolean) => {
        if (simulateSuccess) setIsConnecting(true);
        else setIsSkipping(true);

        try {
            const res = await fetch("/api/onboarding/whatsapp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ simulateSuccess })
            });

            if (!res.ok) throw new Error("API Error");

            // Proceed to sandbox testing
            router.push("/onboarding/sandbox");
        } catch (err) {
            console.error(err);
            alert("Hubo un error al procesar la solicitud.");
        } finally {
            setIsConnecting(false);
            setIsSkipping(false);
        }
    };

    return (
        <div className="relative pb-32">
            <div className="pt-24 px-4 flex flex-col gap-8 max-w-lg mx-auto text-center">

                <div className="flex justify-center mb-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#3DC185]/20 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-20 h-20 bg-[#3DC185] rounded-3xl flex items-center justify-center transform rotate-3 shadow-lg border border-[#3DC185]/60">
                            <Icon name="solar:chat-round-line-bold" size={40} className="text-white" />
                        </div>
                    </div>
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">Conecta tu WhatsApp</h1>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                        Zentu funcionará como el primer punto de contacto. Necesitamos vincular la cuenta oficial de WhatsApp Business.
                    </p>
                </div>

                <div className="flex flex-col gap-4 text-left bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5"><Icon name="solar:bolt-linear" size={20} className="text-[#3DC185]" /></div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-900">Respuestas al instante</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Atiende 24/7 sin hacer esperar a los clientes.</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5"><Icon name="solar:shield-check-linear" size={20} className="text-[#3DC185]" /></div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-900">Meta API Oficial</p>
                            <p className="text-xs text-zinc-500 mt-0.5">Proceso seguro validado y cifrado por Meta.</p>
                        </div>
                    </div>
                </div>

            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 sm:relative sm:bg-transparent sm:backdrop-blur-none sm:border-transparent sm:px-4 sm:pt-10">
                <div className="max-w-lg mx-auto w-full flex flex-col gap-3">

                    {/* Simulated Dev Button */}
                    <button
                        onClick={() => handleConnect(true)}
                        disabled={isConnecting || isSkipping}
                        className="w-full h-12 flex items-center justify-center rounded-xl bg-[#3DC185] text-white font-medium shadow-sm transition-all disabled:opacity-50 hover:bg-[#32a873] active:scale-[0.98]"
                    >
                        {isConnecting ? <Icon name="solar:refresh-linear" size={20} className="animate-spin" /> : "Conectar WhatsApp (Dev Simulator)"}
                    </button>

                    <button
                        onClick={() => handleConnect(false)}
                        disabled={isConnecting || isSkipping}
                        className="w-full h-12 flex items-center justify-center rounded-xl bg-white text-zinc-700 font-medium shadow-sm border border-zinc-200 transition-all disabled:opacity-50 hover:bg-zinc-50 active:scale-[0.98]"
                    >
                        {isSkipping ? <Icon name="solar:refresh-linear" size={20} className="animate-spin" /> : "Conectar Después"}
                    </button>

                    <p className="text-xs text-center text-zinc-400 mt-2 px-6">
                        Para el entorno local, usamos este simulador para avanzar y evitar requerimientos de dominios https con Meta.
                    </p>
                </div>
            </div>
        </div>
    );
}
