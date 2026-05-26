"use client";

/**
 * Botón de cierre de sesión.
 *
 * Cierra la sesión globalmente, invalida cookies y redirecciona.
 */

import { useState } from "react";

import { logoutAction } from "../actions/logout.action";

import type { ReactNode } from "react";

interface LogoutButtonProps {
  redirectTo?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children?: ReactNode;
}

export function LogoutButton({
  redirectTo = "/login",
  variant = "secondary",
  className = "",
  children = "Cerrar sesión",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await logoutAction(redirectTo);
  }

  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors";

  const variantStyles = {
    primary: "bg-red-600 text-white hover:bg-red-700",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <form action={handleLogout}>
      <button
        type="submit"
        disabled={isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      >
        {isLoading ? "Cerrando sesión..." : children}
      </button>
    </form>
  );
}

/**
 * Botón de logout simple (solo icono o texto).
 * Para uso en menús o navegación móvil.
 */
export function LogoutLink({ redirectTo = "/login" }: { redirectTo?: string }) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await logoutAction(redirectTo);
  }

  return (
    <form action={handleLogout} className="inline">
      <button
        type="submit"
        disabled={isLoading}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        {isLoading ? "Saliendo..." : "Cerrar sesión"}
      </button>
    </form>
  );
}
