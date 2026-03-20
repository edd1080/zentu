"use client";

import * as React from "react";
import Link from "next/link";
import { User, Zap, MessageSquare, Bell, CreditCard, ChevronRight } from "lucide-react";

const SETTINGS_ITEMS = [
  {
    href: "/dashboard/settings/profile",
    icon: User,
    label: "Perfil del negocio",
    description: "Nombre, horario, contacto y descripción",
  },
  {
    href: "/dashboard/settings/autonomy",
    icon: Zap,
    label: "Autonomía del agente",
    description: "Configura qué temas responde solo tu agente",
  },
  {
    href: "/dashboard/settings/whatsapp",
    icon: MessageSquare,
    label: "Canal de WhatsApp",
    description: "Estado de conexión y reconexión",
  },
  {
    href: "/dashboard/settings/notifications",
    icon: Bell,
    label: "Notificaciones",
    description: "Hora del resumen diario y silencio nocturno",
  },
  {
    href: "/dashboard/settings/plan",
    icon: CreditCard,
    label: "Plan y soporte",
    description: "Uso del mes y opciones de plan",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-(--surface-base) pb-24">
      <div className="sticky top-0 z-10 bg-(--surface-base) border-b border-(--surface-border) px-4 pt-4 pb-3">
        <h1 className="text-lg font-semibold text-(--text-primary)">Ajustes</h1>
      </div>

      <div className="flex-1 px-4 pt-4 space-y-2">
        {SETTINGS_ITEMS.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-4 py-3 bg-white border border-(--surface-border) rounded-xl hover:border-(--color-primary-700) hover:bg-emerald-50 transition-colors group"
          >
            <div className="h-9 w-9 rounded-full bg-(--surface-muted) flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-(--text-secondary)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-(--text-primary)">{label}</p>
              <p className="text-xs text-(--text-secondary)">{description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-(--text-tertiary) group-hover:text-(--color-primary-700) shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
