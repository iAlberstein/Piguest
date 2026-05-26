/**
 * Admin Dashboard - Panel de Administración.
 *
 * Ruta protegida: solo accesible para ROLE_ADMIN.
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/modules/auth/components/LogoutButton";

export const metadata = {
  title: "Admin Dashboard - Piguest",
  description: "Panel de administración",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verificar autenticación
  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Obtener rol del perfil
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("auth_user_id", user.id)
    .single();

  const profile = profileData as { role: string; full_name: string | null } | null;

  // Verificar rol admin
  if (profile?.role !== "ROLE_ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h1>
            <p className="mt-1 text-gray-600">
              Bienvenido, {profile?.full_name || user.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Usuarios</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Eventos</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Ventas</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">-</p>
          </div>
        </div>
      </div>
    </div>
  );
}
