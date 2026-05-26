"use client";

/**
 * Card contenedor para páginas de autenticación.
 *
 * Diseño minimalista, mobile-first, consistente en todas las páginas auth.
 */

import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  footer?: ReactNode;
}

export function AuthCard({ children, title, subtitle, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-6 sm:py-12">
      <div className="w-full max-w-md space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 sm:mt-2">{subtitle}</p>
          )}
        </div>

        {/* Card Content - optimizado para teclado virtual */}
        <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="text-center text-sm">{footer}</div>}
      </div>
    </div>
  );
}
