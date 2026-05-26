/**
 * Access Control - Control de Acceso.
 *
 * Ruta protegida: ROLE_STAFF, ROLE_PRODUCER o ROLE_ADMIN.
 * Para validación de entradas en puerta.
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";

export const metadata = {
  title: "Control de Acceso - Piguest",
  description: "Validación de entradas",
};

export default async function AccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificar autenticación
  if (!user) {
    redirect("/login?redirect=/access");
  }

  // Obtener rol del perfil
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("auth_user_id", user.id)
    .single();

  const profile = profileData as { role: string; full_name: string | null } | null;

  // Verificar rol staff o superior
  const allowedRoles = ["ROLE_STAFF", "ROLE_PRODUCER", "ROLE_ADMIN"];
  if (!allowedRoles.includes(profile?.role ?? "")) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Control de Acceso
            </h1>
            <p className="mt-1 text-gray-600">
              Validación de entradas en puerta
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Escanear entrada
          </h2>
          <p className="text-gray-600">
            Funcionalidad de escaneo QR en desarrollo...
          </p>
        </div>
      </div>
    </div>
  );
}
