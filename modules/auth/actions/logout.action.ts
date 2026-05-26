"use server";

/**
 * Server Action para cerrar sesión global.
 *
 * Responsabilidades:
 * - Cerrar sesión en Supabase Auth
 * - Invalidar cookies de sesión (automático via @supabase/ssr)
 * - Registrar evento de auditoría
 * - Redireccionar al login
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { logLogout } from "../helpers/audit.helper";
import { signOut } from "../services/auth.service";

/**
 * Cierra la sesión del usuario y redirecciona al login.
 *
 * @param redirectTo - URL opcional para redirección post-logout (default: /login)
 */
export async function logoutAction(redirectTo: string = "/login"): Promise<void> {
  // Obtener usuario antes de cerrar sesión (para auditoría)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const result = await signOut();

  if (!result.success) {
    // Log del error pero igual redireccionamos para garantizar cierre de sesión
    console.error("Error en logout:", result.error?.message);
  }

  // Registrar evento de auditoría si teníamos usuario
  if (user?.id && user?.email) {
    const userMetadata = user.user_metadata as { role?: string } | undefined;
    const role = (userMetadata?.role as 
      | "ROLE_ADMIN"
      | "ROLE_PRODUCER"
      | "ROLE_STAFF"
      | "ROLE_CUSTOMER"
      | undefined) ?? "ROLE_CUSTOMER";

    void logLogout(user.id, user.email, role);
  }

  // Las cookies se invalidan automáticamente por @supabase/ssr
  // El redirect fuerza limpieza completa del estado
  redirect(redirectTo);
}

/**
 * Cierra sesión y redirecciona a una URL específica.
 * Útil para logout desde páginas protegidas.
 */
export async function logoutAndRedirect(redirectPath: string = "/"): Promise<void> {
  await signOut();
  redirect(redirectPath);
}
