"use client";

/**
 * Botón de inicio de sesión con Google.
 *
 * Inicia el flujo OAuth de Google para autenticación.
 */

import { useState } from "react";

import { signInWithOAuth } from "../actions/oauth.action";

interface GoogleSignInButtonProps {
  redirectTo?: string;
}

export function GoogleSignInButton({ redirectTo }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    const result = await signInWithOAuth("google", redirectTo);

    if (result.success && result.url) {
      // Redirigir al usuario a la URL de autorización de Google
      window.location.href = result.url;
    } else {
      // Mostrar error
      alert(result.error?.message ?? "Error al iniciar sesión con Google");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:text-sm"
    >
      {isLoading ? (
        <span>Conectando...</span>
      ) : (
        <>
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continuar con Google</span>
        </>
      )}
    </button>
  );
}
