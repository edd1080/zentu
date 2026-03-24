"use client";

import { useState, useEffect } from "react";

export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "visible" | "fading">("hidden");

  useEffect(() => {
    // Show only once per session (PWA lifecycle)
    if (sessionStorage.getItem("agenti_splash_shown")) return;
    sessionStorage.setItem("agenti_splash_shown", "1");

    setPhase("visible");
    const t1 = setTimeout(() => setPhase("fading"), 1600);
    const t2 = setTimeout(() => setPhase("hidden"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white flex items-center justify-center"
      style={{
        opacity: phase === "fading" ? 0 : 1,
        transition: "opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: phase === "fading" ? "none" : "all",
      }}
    >
      <div
        style={{
          opacity: phase === "visible" ? 1 : 0.7,
          transform: phase === "visible" ? "scale(1)" : "scale(0.85)",
          transition: "all 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Agenti"
          style={{ height: "36px", width: "auto" }}
        />
      </div>
    </div>
  );
}
