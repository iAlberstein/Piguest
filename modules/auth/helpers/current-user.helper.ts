"use server";

/**
 * Helper reutilizable para obtener el usuario actual completo.
 *
 * Incluye:
 * - Perfil completo (profiles)
 * - Rol
 * - Relación con producer (si existe)
 *
 * Optimizado para evitar queries repetidas en la misma request.
 *
 * @see /docs/session-handling.md
 */

import { createClient } from "@/lib/supabase/server";

import type { AuthRole, SessionUser } from "../types/auth.types";

// ============================================================================
// Tipos extendidos
// ============================================================================

/**
 * Perfil completo del usuario con metadata adicional
 */
export interface CurrentUserProfile {
  id: string;
  authUserId: string;
  email: string;
  fullName: string | null;
  dni: string | null;
  role: AuthRole;
  phone: string | null;
  province: string | null;
  locality: string | null;
  birthDate: string | null;
  gender: string | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Producer relacionado al usuario (si existe)
 */
export interface CurrentUserProducer {
  id: string;
  businessName: string;
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
}

/**
 * Usuario completo retornado por currentUser()
 */
export interface CurrentUser {
  sessionUser: SessionUser;
  profile: CurrentUserProfile;
  producer: CurrentUserProducer | null;
}

/**
 * Resultado de la operación
 */
export interface CurrentUserResult {
  success: true;
  user: CurrentUser;
}

export interface CurrentUserError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// ============================================================================
// Helper principal
// ============================================================================

/**
 * Obtiene el usuario actual completo con perfil y producer.
 *
 * Ejemplo en Server Component:
 * ```tsx
 * const result = await currentUser();
 * if (!result.success) redirect("/login");
 * const { profile, producer } = result.user;
 * ```
 *
 * Ejemplo en Server Action:
 * ```tsx
 * const result = await currentUser();
 * if (!result.success) return { error: "No autenticado" };
 * const userRole = result.user.profile.role;
 * ```
 */
export async function currentUser(): Promise<
  CurrentUserResult | CurrentUserError
> {
  try {
    const supabase = await createClient();

    // 1. Verificar sesión
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        success: false,
        error: {
          code: "auth/unauthenticated",
          message: "No hay sesión activa",
        },
      };
    }

    // 2. Obtener perfil y producer en una sola query (JOIN)
    const { data: rawData, error: profileError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        auth_user_id,
        email,
        full_name,
        dni,
        role,
        phone,
        province,
        locality,
        birth_date,
        gender,
        is_blocked,
        created_at,
        updated_at,
        producers (
          id,
          business_name,
          legal_name,
          tax_id,
          address,
          phone,
          email,
          website,
          is_active
        )
      `
      )
      .eq("auth_user_id", authUser.id)
      .single();

    if (profileError || !rawData) {
      return {
        success: false,
        error: {
          code: "profile/not-found",
          message: "Perfil no encontrado",
        },
      };
    }

    // Type assertion para el resultado de Supabase
    const profileData = rawData as {
      id: string;
      auth_user_id: string;
      email: string;
      full_name: string | null;
      dni: string | null;
      role: string;
      phone: string | null;
      province: string | null;
      locality: string | null;
      birth_date: string | null;
      gender: string | null;
      is_blocked: boolean;
      created_at: string;
      updated_at: string;
      producers: Array<{
        id: string;
        business_name: string;
        legal_name: string | null;
        tax_id: string | null;
        address: string | null;
        phone: string | null;
        email: string | null;
        website: string | null;
        is_active: boolean;
      }> | null;
    };

    // 3. Transformar datos
    const profile: CurrentUserProfile = {
      id: profileData.id,
      authUserId: profileData.auth_user_id,
      email: profileData.email,
      fullName: profileData.full_name,
      dni: profileData.dni,
      role: (profileData.role as AuthRole) ?? "ROLE_CUSTOMER",
      phone: profileData.phone,
      province: profileData.province,
      locality: profileData.locality,
      birthDate: profileData.birth_date,
      gender: profileData.gender,
      isBlocked: profileData.is_blocked,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    // 4. Extraer producer (puede ser null o array vacío)
    const producerRaw = profileData.producers;

    const producer: CurrentUserProducer | null = producerRaw?.[0]
      ? {
          id: producerRaw[0].id,
          businessName: producerRaw[0].business_name,
          legalName: producerRaw[0].legal_name,
          taxId: producerRaw[0].tax_id,
          address: producerRaw[0].address,
          phone: producerRaw[0].phone,
          email: producerRaw[0].email,
          website: producerRaw[0].website,
          isActive: producerRaw[0].is_active,
        }
      : null;

    // 5. Crear SessionUser
    const sessionUser: SessionUser = {
      id: authUser.id,
      email: authUser.email ?? "",
      role: profile.role,
      fullName: profile.fullName,
      isBlocked: profile.isBlocked,
    };

    return {
      success: true,
      user: {
        sessionUser,
        profile,
        producer,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "auth/unknown-error",
        message:
          error instanceof Error ? error.message : "Error desconocido",
      },
    };
  }
}

// ============================================================================
// Helpers específicos por rol
// ============================================================================

/**
 * Obtiene el usuario solo si es admin.
 */
export async function currentAdmin(): Promise<
  CurrentUserResult | CurrentUserError
> {
  const result = await currentUser();

  if (!result.success) {
    return result;
  }

  if (result.user.profile.role !== "ROLE_ADMIN") {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "Requiere rol de administrador",
      },
    };
  }

  return result;
}

/**
 * Obtiene el usuario solo si es productor o admin.
 */
export async function currentProducer(): Promise<
  CurrentUserResult | CurrentUserError
> {
  const result = await currentUser();

  if (!result.success) {
    return result;
  }

  const allowedRoles: AuthRole[] = ["ROLE_PRODUCER", "ROLE_ADMIN"];
  if (!allowedRoles.includes(result.user.profile.role)) {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "Requiere rol de productor",
      },
    };
  }

  return result;
}

/**
 * Obtiene el usuario solo si es staff, productor o admin.
 */
export async function currentStaff(): Promise<
  CurrentUserResult | CurrentUserError
> {
  const result = await currentUser();

  if (!result.success) {
    return result;
  }

  const allowedRoles: AuthRole[] = [
    "ROLE_STAFF",
    "ROLE_PRODUCER",
    "ROLE_ADMIN",
  ];
  if (!allowedRoles.includes(result.user.profile.role)) {
    return {
      success: false,
      error: {
        code: "auth/forbidden",
        message: "Requiere rol de staff",
      },
    };
  }

  return result;
}
