"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Link as LinkIcon, Loader2, Square, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceEditorProps {
    value: string;
    onChange: (val: string) => void;
    isProcessing?: boolean;
}

export function ServiceEditor({ value, onChange, isProcessing = false }: ServiceEditorProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [isScraping, setIsScraping] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Stop recording when component unmounts
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                stream.getTracks().forEach((track) => track.stop());
                await processAudio(audioBlob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError(null);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied or error:", err);
            setError("No se pudo acceder al micrófono.");
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const processAudio = async (blob: Blob) => {
        setIsTranscribing(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("audio", blob, "voice_note.webm");

            const res = await fetch("/api/onboarding/voice", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Voice transcription failed");

            const data = await res.json();
            if (data.text) {
                onChange(value ? `${value}\n\n[Nota de voz transcripta]:\n${data.text}` : data.text);
            }
        } catch (err) {
            console.error(err);
            setError("Error al transcribir el audio, pero puedes escribirlo a mano.");
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleScrapeLink = async () => {
        if (!linkUrl.trim()) return;
        setIsScraping(true);
        setError(null);

        try {
            const res = await fetch("/api/onboarding/link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: linkUrl }),
            });

            if (!res.ok) throw new Error("Link scraping failed");

            const data = await res.json();
            if (data.text) {
                onChange(value ? `${value}\n\n[Información Extraída de Website]:\n${data.text}` : data.text);
                setShowLinkInput(false);
                setLinkUrl("");
            }
        } catch (err) {
            console.error(err);
            // Non-blocking error
            setError("No se pudo extraer la información del sitio, revisa tu conexión o el enlace.");
        } finally {
            setIsScraping(false);
        }
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Ejemplo: Corte de pelo hombre - $250. Tinte básico - Desde $800. Solo atendemos con cita previa..."
                    className="w-full min-h-[160px] p-4 text-sm bg-zinc-50 border border-zinc-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-zinc-400"
                    disabled={isProcessing || isTranscribing || isScraping}
                />
                {(isTranscribing || isScraping) && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2 text-emerald-700">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xs font-semibold">
                                {isTranscribing ? "Transcribiendo nota de voz..." : "Extrayendo info del link..."}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3 flex items-start gap-2 border border-amber-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Voice Note Button */}
                {isRecording ? (
                    <div className="flex items-center gap-3 bg-red-50 text-red-700 px-4 py-2.5 rounded-full border border-red-200 flex-1">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-sm font-semibold whitespace-nowrap tabular-nums">
                            {formatTime(recordingTime)}
                        </span>
                        <span className="text-xs flex-1 truncate opacity-80">Grabando...</span>
                        <button
                            onClick={handleStopRecording}
                            className="p-1 hover:bg-red-100 rounded text-red-700"
                            title="Detener"
                        >
                            <Square className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-full text-zinc-700 text-sm font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
                        onClick={handleStartRecording}
                        disabled={isProcessing || isTranscribing || isScraping}
                    >
                        <Mic className="w-4 h-4 text-zinc-500" />
                        Dictar
                    </button>
                )}

                {/* Link Button */}
                {!isRecording && (
                    <button
                        type="button"
                        className={cn(
                            "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 border rounded-full text-sm font-semibold transition-colors",
                            showLinkInput
                                ? "bg-zinc-100 border-zinc-200 text-zinc-900"
                                : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300"
                        )}
                        onClick={() => setShowLinkInput(!showLinkInput)}
                        disabled={isProcessing || isScraping || isTranscribing}
                    >
                        <LinkIcon className="w-4 h-4 text-zinc-500" />
                        {showLinkInput ? "Cerrar Link" : "Desde Link"}
                    </button>
                )}
            </div>

            {/* Link Input UI */}
            {showLinkInput && !isRecording && (
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-2 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <input
                        type="url"
                        className="flex-1 bg-transparent text-sm px-2 focus:outline-none"
                        placeholder="Pegar enlace de menú o servicios"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        disabled={isScraping}
                    />
                    <button
                        type="button"
                        onClick={handleScrapeLink}
                        disabled={!linkUrl.trim() || isScraping}
                        className="px-4 py-1.5 bg-zinc-900 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                    >
                        Extraer
                    </button>
                </div>
            )}
        </div>
    );
}
