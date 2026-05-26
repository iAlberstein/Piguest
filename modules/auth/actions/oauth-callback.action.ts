"use server";

/**
 * Server Action para manejar callback OAuth.
 *
 * Verifica/crea el perfil del usuario después de autenticación OAuth.
 */

import { createServiceClient } from "@/lib/supabase/server";

import type { AuthResult } from "../types/auth.types";

/**
 * Maneja el callback de OAuth.
 * Verifica si existe el perfil, si no, lo crea.
 *
 * @returns Resultado con el usuario
 */
export async function handleOAuthCallback(): Promise<AuthResult> {
  try {
    const serviceClient = await createServiceClient();

    // Verificar sesión actual (establecida por Supabase después del OAuth)
    const {
      data: { user },
      error: userError,
    } = await serviceClient.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: {
          code: "oauth/no-user",
          message: "No se pudo obtener el usuario después del OAuth",
        },
      };
    }

    // Verificar si el perfil ya existe
    const { data: profileData } = await serviceClient
      .from("profiles")
      .select("id, role, is_blocked")
      .eq("auth_user_id", user.id)
      .single();

    const existingProfile = profileData as
      | { role: "ROLE_CUSTOMER" | "ROLE_ADMIN" | "ROLE_PRODUCER" | "ROLE_STAFF"; is_blocked: boolean }
      | null;

    if (existingProfile) {
      // Perfil existe, retornar usuario
      return {
        success: true,
        user: {
          id: user.id,
          email: user.email ?? "",
          role: existingProfile.role,
          fullName: (user.user_metadata?.full_name as string) ?? null,
          isBlocked: existingProfile.is_blocked,
        },
      };
    }

    // Perfil no existe, crearlo (nuevo usuario OAuth)
    const fullName =
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      null;
    const email = user.email ?? "";

    const profileInsert = {
      auth_user_id: user.id,
      email,
      full_name: fullName,
      dni: null as null,
      role: "ROLE_CUSTOMER" as const,
      phone: null as null,
      province: null as null,
      locality: null as null,
      birth_date: null as null,
      gender: null as null,
      is_blocked: false,
    };

    const { error: insertError } = await serviceClient
      .from("profiles")
      .insert([profileInsert as unknown as never]);

    if (insertError) {
      return {
        success: false,
        error: {
          code: "profile/creation-failed",
          message: "Error al crear el perfil de usuario",
        },
      };
    }

    return {
      success: true,
      user: {
        id: user.id,
        email,
        role: "ROLE_CUSTOMER",
        fullName,
        isBlocked: false,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "oauth/unknown-error",
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido en OAuth callback",
      },
    };
  }
}
