/**
 * Guards de autorización reutilizables para Piguest.
 *
 * Estas funciones verifican roles y autenticación en:
 * - Server Components
 * - Server Actions
 * - Route Handlers
 *
 * NO usar en client components (verificación debe ser server-side)
 */

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { AUTH_ROLES, type AuthRole, type SessionUser } from "../types/auth.types";

// ============================================================================
// Tipos de retorno
// ============================================================================

interface GuardSuccess {
  success: true;
  user: SessionUser;
}

interface GuardFailure {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type GuardResult = GuardSuccess | GuardFailure;

// ============================================================================
// Guard base - Autenticación
// ============================================================================

/**
 * Verifica que el usuario esté autenticado.
 *
 * @param redirectTo - URL a redirigir si no está autenticado (para Server Components)
 * @returns Usuario autenticado o redirección/error
 */
export async function requireAuth(
  redirectTo: string = "/login"
): Promise<SessionUser> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`${redirectTo}?redirect=${encodeURIComponent(redirectTo)}`);
  }

  // Obtener rol desde el perfil
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name, is_blocked")
    .eq("auth_user_id", user.id)
    .single();

  const profile = profileData as
    | { role: string; full_name: string | null; is_blocked: boolean }
    | null;

  const role = (profile?.role as AuthRole) ?? AUTH_ROLES.CUSTOMER;

  if (profile?.is_blocked) {
    redirect("/blocked");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    role,
    fullName: profile?.full_name ?? null,
    isBlocked: profile?.is_blocked ?? false,
  };
}

/**
 * Verifica autenticación sin redirección automática.
 * Útil para Server Actions y Route Handlers.
 */
export async function requireAuthStrict(): Promise<GuardResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      success: false,
      error: {
        code: "auth/unauthenticated",
        message: "Debes iniciar sesión para realizar esta acción",
      },
    };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role, full_name, is_blocked")
    .eq("auth_user_id", user.id)
    .single();

  const profile = profileData as
    | { role: string; full_name: string | null; is_blocked: boolean }
    | null;

  if (profile?.is_blocked) {
    return {
      success: false,
      error: {
        code: "auth/blocked",
        message: "Tu cuenta ha sido bloqueada",
      },
    };
  }

  const role = (profile?.role as AuthRole) ?? AUTH_ROLES.CUSTOMER;

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email ?? "",
      role,
      fullName: profile?.full_name ?? null,
      isBlocked: profile?.is_blocked ?? false,
    },
  };
}

// ============================================================================
// Guards por rol
// ============================================================================

/**
 * Verifica que el usuario sea ADMIN.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== AUTH_ROLES.ADMIN) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Verifica que el usuario sea PRODUCER o ADMIN.
 */
export async function requireProducer(): Promise<SessionUser> {
  const user = await requireAuth();

  if (user.role !== AUTH_ROLES.PRODUCER && user.role !== AUTH_ROLES.ADMIN) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Verifica que el usuario sea STAFF, PRODUCER o ADMIN.
 */
export async function requireStaff(): Promise<SessionUser> {
  const user = await requireAuth();

  const isStaff =
    user.role === AUTH_ROLES.STAFF ||
    user.role === AUTH_ROLES.PRODUCER ||
    user.role === AUTH_ROLES.ADMIN;

  if (!isStaff) {
    redirect("/unauthorized");
  }

  return user;
}

// ============================================================================
// Guards estrictos (para Server Actions / Route Handlers)
// ============================================================================

/**
 * Verifica rol ADMIN sin redirección.
 * Retorna error si no cumple.
 */
export async function requireAdminStrict(): Promise<GuardResult> {
  const result = await requireAuthStrict();

  if (!result.success) {
    return result;
  }

  if (result.user.role !== AUTH_ROLES.ADMIN) {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "No tenés permisos de administrador",
      },
    };
  }

  return result;
}

/**
 * Verifica rol PRODUCER o ADMIN sin redirección.
 */
export async function requireProducerStrict(): Promise<GuardResult> {
  const result = await requireAuthStrict();

  if (!result.success) {
    return result;
  }

  const isProducerOrAdmin =
    result.user.role === AUTH_ROLES.PRODUCER ||
    result.user.role === AUTH_ROLES.ADMIN;

  if (!isProducerOrAdmin) {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "No tenés permisos de productor",
      },
    };
  }

  return result;
}

/**
 * Verifica rol STAFF, PRODUCER o ADMIN sin redirección.
 */
export async function requireStaffStrict(): Promise<GuardResult> {
  const result = await requireAuthStrict();

  if (!result.success) {
    return result;
  }

  const isStaffOrHigher =
    result.user.role === AUTH_ROLES.STAFF ||
    result.user.role === AUTH_ROLES.PRODUCER ||
    result.user.role === AUTH_ROLES.ADMIN;

  if (!isStaffOrHigher) {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "No tenés permisos de staff",
      },
    };
  }

  return result;
}

// ============================================================================
// Guard genérico por rol
// ============================================================================

/**
 * Verifica que el usuario tenga uno de los roles especificados.
 *
 * @param allowedRoles - Array de roles permitidos
 * @param redirectTo - URL de redirección si no cumple
 */
export async function requireRole(
  allowedRoles: AuthRole[],
  redirectTo: string = "/unauthorized"
): Promise<SessionUser> {
  const user = await requireAuth();

  if (!(allowedRoles as string[]).includes(user.role)) {
    redirect(redirectTo);
  }

  return user;
}

/**
 * Versión estricta sin redirección.
 */
export async function requireRoleStrict(
  allowedRoles: AuthRole[]
): Promise<GuardResult> {
  const result = await requireAuthStrict();

  if (!result.success) {
    return result;
  }

  if (!(allowedRoles as string[]).includes(result.user.role)) {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "No tenés los permisos necesarios",
      },
    };
  }

  return result;
}
