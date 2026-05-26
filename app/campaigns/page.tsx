/**
 * Campaigns - Gestión de Campañas.
 *
 * Ruta protegida: ROLE_PRODUCER o ROLE_ADMIN.
 * Para gestión de campañas de marketing.
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";

export const metadata = {
  title: "Campañas - Piguest",
  description: "Gestión de campañas",
};

export default async function CampaignsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificar autenticación
  if (!user) {
    redirect("/login?redirect=/campaigns");
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
            <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
            <p className="mt-1 text-gray-600">
              Gestión de campañas de marketing
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <p className="text-gray-600">Listado de campañas en desarrollo...</p>
        </div>
      </div>
    </div>
  );
}
