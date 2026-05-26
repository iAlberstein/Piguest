"use client";

/**
 * Formulario para solicitar recuperación de contraseña.
 *
 * Campo: Email
 */

import { useState } from "react";

import { forgotPasswordAction } from "../actions/forgot-password.action";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await forgotPasswordAction(formData.get("email") as string);

    if (result.success) {
      setIsSent(true);
    } else {
      setError(result.error?.message ?? "Error al enviar email");
    }

    setIsLoading(false);
  }

  if (isSent) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-center">
        <p className="text-sm text-green-800">
          Si tu email está registrado, recibirás instrucciones para recuperar tu
          contraseña.
        </p>
      </div>
    );
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
        <p className="mt-1 text-xs text-gray-500">
          Te enviaremos un link para restablecer tu contraseña.
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Enviando..." : "Enviar link"}
      </button>
    </form>
  );
}
