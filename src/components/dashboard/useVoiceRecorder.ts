"use client";

import * as React from "react";
import type { QuickInstructPayload } from "./InputPanel";

interface UseVoiceRecorderOptions {
  onSubmit: (payload: QuickInstructPayload) => void;
  onStart: () => void;
  onStop: () => void;
}

export function useVoiceRecorder({ onSubmit, onStart, onStop }: UseVoiceRecorderOptions) {
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const base64 = dataUrl.split(",")[1];
          onSubmit({ type: "voice_note", audioBase64: base64, mimeType });
          onStop();
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      onStart();
    } catch {
      // getUserMedia denied — fail silently
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  return { startRecording, stopRecording };
}
