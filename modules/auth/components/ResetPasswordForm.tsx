"use client";

/**
 * Formulario para establecer nueva contraseña.
 *
 * Campos:
 * - Nueva contraseña
 * - Confirmar contraseña
 */

import { useState } from "react";

import { resetPasswordAction } from "../actions/reset-password.action";

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const result = await resetPasswordAction(
      formData.get("password") as string,
      formData.get("confirmPassword") as string
    );

    if (result.success) {
      setIsSuccess(true);
      onSuccess?.();
    } else {
      setError(result.error?.message ?? "Error al actualizar contraseña");
    }

    setIsLoading(false);
  }

  if (isSuccess) {
    return (
      <div className="rounded-md bg-green-50 p-4 text-center">
        <p className="text-sm text-green-800">
          Tu contraseña ha sido actualizada correctamente.
        </p>
        <a
          href="/login"
          className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Iniciar sesión
        </a>
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
          htmlFor="password"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Mínimo 8 caracteres"
        />
        <p className="mt-1 text-xs text-gray-500">
          Debe contener mayúscula, minúscula y número
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-medium text-gray-700 sm:text-sm"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="Repite la contraseña"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Actualizando..." : "Actualizar contraseña"}
      </button>
    </form>
  );
}
