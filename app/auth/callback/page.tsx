/**
 * Página de callback para autenticación de Supabase.
 *
 * Ruta: /auth/callback
 *
 * Maneja:
 * - Recovery: Establecer nueva contraseña
 * - Confirmación de email (futuro)
 * - OAuth callbacks (futuro)
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { handleOAuthCallback } from "@/modules/auth/actions/oauth-callback.action";
import { ResetPasswordForm } from "@/modules/auth/components/ResetPasswordForm";

export const metadata = {
  title: "Restablecer contraseña - Piguest",
  description: "Establecé tu nueva contraseña",
};

interface AuthCallbackPageProps {
  searchParams: Promise<{
    type?: string;
    error?: string;
    error_description?: string;
    redirect?: string;
  }>;
}

export default async function AuthCallbackPage({
  searchParams,
}: AuthCallbackPageProps) {
  const params = await searchParams;
  const { type, error, error_description: errorDescription } = params;

  // Manejar errores de Supabase
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
          <div className="rounded-md bg-red-50 p-4 text-center">
            <p className="text-sm text-red-800">
              {errorDescription ?? "Error en la autenticación"}
            </p>
            <a
              href="/forgot-password"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Solicitar nuevo link
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Manejar recovery (reset password)
  if (type === "recovery") {
    // Verificar que hay sesión activa (el usuario llegó via recovery link válido)
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
            <div className="rounded-md bg-red-50 p-4 text-center">
              <p className="text-sm text-red-800">
                El link ha expirado o no es válido. Solicitá un nuevo link de
                recuperación.
              </p>
              <a
                href="/forgot-password"
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Solicitar nuevo link
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Establecé tu nueva contraseña para continuar.
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <ResetPasswordForm onSuccess={() => redirect("/login")} />
          </div>
        </div>
      </div>
    );
  }

  // Manejar OAuth callback
  if (type === "oauth") {
    const result = await handleOAuthCallback();

    if (result.success) {
      // Redirigir al destino original o al home
      const redirectTo = params.redirect ?? "/";
      redirect(redirectTo);
    } else {
      // Mostrar error
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
            <div className="rounded-md bg-red-50 p-4 text-center">
              <p className="text-sm text-red-800">
                {result.error?.message ?? "Error en la autenticación"}
              </p>
              <a
                href="/login"
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Volver al login
              </a>
            </div>
          </div>
        </div>
      );
    }
  }

  // Por defecto, redirigir al login
  redirect("/login");
}
