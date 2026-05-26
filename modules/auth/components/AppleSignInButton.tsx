"use client";

/**
 * Botón de inicio de sesión con Apple.
 *
 * Inicia el flujo OAuth de Apple para autenticación.
 * Compatible con iOS, macOS y web.
 */

import { useState } from "react";

import { signInWithOAuth } from "../actions/oauth.action";

interface AppleSignInButtonProps {
  redirectTo?: string;
}

export function AppleSignInButton({ redirectTo }: AppleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);

    const result = await signInWithOAuth("apple", redirectTo);

    if (result.success && result.url) {
      // Redirigir al usuario a la URL de autorización de Apple
      window.location.href = result.url;
    } else {
      // Mostrar error
      alert(result.error?.message ?? "Error al iniciar sesión con Apple");
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50 sm:text-sm"
    >
      {isLoading ? (
        <span>Conectando...</span>
      ) : (
        <>
          <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4-2.87-2.98-2.45-7.52 1.06-10.2 1.52-1.15 3.03-1.02 4.08-.1.55.47.85.47 1.4 0 1.18-.88 2.53-.76 4.15.1.67.37 1.2.88 1.59 1.53-2.74 1.76-2.28 6.43.5 7.57zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span>Continuar con Apple</span>
        </>
      )}
    </button>
  );
}
