/**
 * Producer Dashboard - Panel de Productor.
 *
 * Ruta protegida: ROLE_PRODUCER o ROLE_ADMIN.
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";

export const metadata = {
  title: "Producer Dashboard - Piguest",
  description: "Panel de productor",
};

export default async function ProducerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificar autenticación
  if (!user) {
    redirect("/login?redirect=/producer");
  }

  // Obtener rol del perfil
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("auth_user_id", user.id)
    .single();

  const profile = profileData as { role: string; full_name: string | null } | null;

  // Verificar rol productor o admin
  const allowedRoles = ["ROLE_PRODUCER", "ROLE_ADMIN"];
  if (!allowedRoles.includes(profile?.role ?? "")) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Productor
            </h1>
            <p className="mt-1 text-gray-600">
              Bienvenido, {profile?.full_name || user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Mis Eventos</h3>
            <p className="mt-2 text-gray-600">Gestiona tus espectáculos</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">Ventas</h3>
            <p className="mt-2 text-gray-600">Resumen de entradas vendidas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
