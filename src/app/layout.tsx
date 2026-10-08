import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Democracy Box — Voto por Ranking (IRV)",
  description:
    "Sistema transparente e educativo de demonstração do Voto por Ranking (Instant-Runoff Voting) com auditoria pública de cédulas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
      >
        <SiteHeader />
        <main className="flex-1 container mx-auto max-w-6xl px-4 py-8">{children}</main>
        <SiteFooter />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
