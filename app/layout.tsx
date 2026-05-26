import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piguest - Sistema de Gestión de Eventos",
  description: "Plataforma moderna para gestión de eventos, tickets y accesos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {/* Layout base minimalista */}
        <div className="flex min-h-full flex-col">
          {/* Header placeholder - se expandirá después */}
          <header className="border-b border-neutral-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <span className="text-lg font-semibold text-neutral-900">Piguest</span>
              </div>
            </div>
          </header>

          {/* Main content con container responsive */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
              {children}
            </div>
          </main>

          {/* Footer placeholder - se expandirá después */}
          <footer className="border-t border-neutral-200 bg-white py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-neutral-500">
                Piguest &copy; {new Date().getFullYear()}
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
