"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastProps {
  id: string;
  type?: ToastType;
  message: string;
  onClose: (id: string) => void;
}

function Toast({ id, type = "info", message, onClose }: ToastProps) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-(--color-success-600)" />,
    error: <AlertCircle className="h-5 w-5 text-(--color-error-600)" />,
    warning: <AlertTriangle className="h-5 w-5 text-(--color-warning-600)" />,
    info: <Info className="h-5 w-5 text-(--color-info-600)" />,
  };

  const bgStyles = {
    success: "bg-(--color-success-50) border-(--color-success-200)",
    error: "bg-(--color-error-50) border-(--color-error-200)",
    warning: "bg-(--color-warning-50) border-(--color-warning-200)",
    info: "bg-(--color-info-50) border-(--color-info-200)",
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, type === "error" ? 5000 : 3000);
    return () => clearTimeout(timer);
  }, [id, type, onClose]);

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5 fade-in-0 pointer-events-auto",
        bgStyles[type]
      )}
    >
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm font-medium text-(--text-primary)">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 rounded-md p-1 text-(--text-tertiary) hover:bg-black/5 hover:text-(--text-secondary) transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Simple Toast Provider System
type ToastData = Omit<ToastProps, "id" | "onClose">;

interface ToastContextValue {
  toast: (data: ToastData) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastData & { id: string })[]>([]);

  const toast = React.useCallback((data: ToastData) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...data, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:left-auto sm:items-end pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
