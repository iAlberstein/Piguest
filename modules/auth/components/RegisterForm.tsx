"use client";

/**
 * Formulario de registro de usuario.
 *
 * Campos:
 * - Nombre
 * - Apellido
 * - DNI
 * - Email
 * - Provincia
 * - Localidad
 * - Contraseña
 * - Confirmar contraseña
 */

import { useState } from "react";

import { registerAction } from "../actions/register.action";

import type { RegisterFormData } from "../forms/register.schema";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({ onSuccess, redirectTo }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    const data: RegisterFormData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dni: formData.get("dni") as string,
      email: formData.get("email") as string,
      province: formData.get("province") as string,
      locality: formData.get("locality") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const result = await registerAction(data);

    if (result.success) {
      onSuccess?.();
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } else {
      setError(result.error?.message ?? "Error en el registro");
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label
            htmlFor="firstName"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Nombre
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            minLength={2}
            maxLength={50}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Juan"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Apellido
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            minLength={2}
            maxLength={50}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Pérez"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dni" className="block text-xs font-medium text-gray-700 sm:text-sm">
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          required
          minLength={7}
          maxLength={9}
          pattern="\d+"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="12345678"
        />
      </div>

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
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="tu@email.com"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <label
            htmlFor="province"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Provincia
          </label>
          <input
            id="province"
            name="province"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Buenos Aires"
          />
        </div>

        <div>
          <label
            htmlFor="locality"
            className="block text-xs font-medium text-gray-700 sm:text-sm"
          >
            Localidad
          </label>
          <input
            id="locality"
            name="locality"
            type="text"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="CABA"
          />
        </div>
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
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
