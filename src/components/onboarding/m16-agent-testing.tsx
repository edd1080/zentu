"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
};

export function M16AgentTesting({ businessName, industry }: { businessName: string, industry: string }) {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        { id: "1", role: "assistant", content: `¡Hola! Ya estoy configurado para atender a los clientes de ${businessName}. ¡Pruébame! Pregúntame sobre nuestros horarios o servicios.` }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isActivating, setIsActivating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            // Note: Sending the entire history for context
            const res = await fetch("/api/agent/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg], businessName, industry })
            });

            if (!res.ok) throw new Error("Agent failed to respond");

            const data = await res.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.response
            }]);

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Lo siento, tuve un problema interno de conexión. Por favor reintenta."
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleActivate = async () => {
        setIsActivating(true);
        try {
            const res = await fetch("/api/onboarding/activate", { method: "POST" });
            if (!res.ok) throw new Error("API Error");

            // Done! Send to Dashboard
            router.refresh();
            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            alert("No se pudo activar el agente.");
            setIsActivating(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col relative pb-[140px]">
            <div className="pt-24 px-4 max-w-lg mx-auto w-full text-center">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">Prueba tu Agente</h1>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto mb-6">
                    Manda un par de mensajes para asegurarte que responde como esperas. (Sandbox)
                </p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 px-4 max-w-lg mx-auto w-full flex flex-col gap-4">
                {messages.map(m => (
                    <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "self-end flex-row-reverse" : "self-start"}`}>
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === "user" ? "bg-zinc-200" : "bg-[#3DC185]/10"}`}>
                            {m.role === "user" ? <Icon name="solar:user-linear" size={16} className="text-zinc-600" /> : <Icon name="solar:cpu-linear" size={20} className="text-[#3DC185]" />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm ${m.role === "user" ? "bg-zinc-900 text-white rounded-tr-sm" : "bg-white border text-zinc-800 rounded-tl-sm shadow-sm"}`}>
                            {m.content}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 max-w-[85%] self-start">
                        <div className="shrink-0 w-8 h-8 rounded-full bg-[#3DC185]/10 flex items-center justify-center">
                            <Icon name="solar:cpu-linear" size={20} className="text-[#3DC185]" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white border rounded-tl-sm shadow-sm flex gap-1 items-center">
                            <div className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce" />
                            <div className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce delay-75" />
                            <div className="w-2 h-2 rounded-full bg-zinc-300 animate-bounce delay-150" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input & Activate Area (Fixed Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] sm:relative sm:border-transparent sm:shadow-none sm:bg-transparent">
                <div className="max-w-lg mx-auto p-4 flex flex-col gap-3">
                    <div className="flex gap-2 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            placeholder="Escribe un mensaje de prueba..."
                            className="flex-1 px-4 py-3 bg-zinc-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3DC185]/20 focus:bg-white focus:border-[#3DC185]/30 transition-all"
                            disabled={isTyping || isActivating}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping || isActivating}
                            className="shrink-0 w-11 h-11 rounded-full bg-[#3DC185] text-white flex items-center justify-center shadow-sm disabled:opacity-50 transition-transform hover:bg-[#32a873] active:scale-95"
                        >
                            <Icon name="solar:plain-2-linear" size={20} />
                        </button>
                    </div>

                    <button
                        onClick={handleActivate}
                        disabled={isActivating || messages.length < 2 || isTyping}
                        className="w-full mt-2 h-12 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 text-white font-medium shadow-sm transition-all disabled:opacity-40 hover:bg-zinc-800 active:scale-[0.98]"
                    >
                        {isActivating ? (
                            <Icon name="solar:refresh-linear" size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Icon name="solar:check-circle-linear" size={20} />
                                <span>Activar Agente para {businessName}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
