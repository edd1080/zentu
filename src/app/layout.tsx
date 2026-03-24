import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import { SplashScreen } from "@/components/SplashScreen";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zentu — Tu negocio responde solo",
  description:
    "Agente de IA para WhatsApp que responde mensajes de clientes en nombre de tu negocio. Tú solo supervisas.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zentu",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3DC185",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${dmSans.variable} font-sans antialiased`}>
        <QueryProvider>
          <SplashScreen />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
