/**
 * Página de acceso no autorizado (403).
 *
 * Se muestra cuando un usuario autenticado intenta acceder
 * a una ruta para la cual no tiene permisos.
 */

import Link from "next/link";

export const metadata = {
  title: "Acceso no autorizado - Piguest",
  description: "No tenés permisos para acceder a esta sección",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        {/* Icono de prohibido */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        {/* Título y mensaje */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Acceso no autorizado
          </h1>
          <p className="mt-2 text-gray-600">
            No tenés permisos para acceder a esta sección.
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Volver al inicio
          </Link>

          <Link
            href="/login"
            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Iniciar sesión con otra cuenta
          </Link>
        </div>

        {/* Ayuda */}
        <p className="text-sm text-gray-500">
          Si creés que esto es un error, contactá al soporte.
        </p>
      </div>
    </div>
  );
}
