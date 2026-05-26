"use client";

/**
 * Formulario de login de usuario.
 *
 * Campos:
 * - Email
 * - Contraseña
 */

import { useState } from "react";

import { loginAction } from "../actions/login.action";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await loginAction({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (result.success) {
      onSuccess?.();
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } else {
      setError(result.error?.message ?? "Error al iniciar sesión");
    }

    setIsLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-3 sm:space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Tu contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
