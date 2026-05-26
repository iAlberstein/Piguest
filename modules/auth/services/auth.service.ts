/**
 * Servicio de autenticación para Piguest.
 *
 * Responsabilidades:
 * - Operaciones de auth con Supabase (signUp, signIn, signOut)
 * - Gestión de sesiones
 * - Recuperación de contraseña
 * - Obtención de usuario actual
 *
 * Este servicio NO contiene lógica de UI.
 * Solo opera con datos y retorna resultados tipados.
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";

import {
  isAuthRole,
  type AuthResult,
  type AuthSession,
  type LoginCredentials,
  type PasswordResetConfirmation,
  type PasswordResetRequest,
  type RegisterCredentials,
  type SessionUser,
} from "../types/auth.types";

// ============================================================================
// Utilidades internas
// ============================================================================

/**
 * Mapea un usuario de Supabase Auth a SessionUser
 */
async function mapToSessionUser(
  supabaseUser: unknown,
  role: string
): Promise<SessionUser | null> {
  if (!supabaseUser || typeof supabaseUser !== "object") {
    return null;
  }

  const user = supabaseUser as {
    id: string;
    email?: string;
    user_metadata?: { full_name?: string };
  };

  const validRole = isAuthRole(role) ? role : "ROLE_CUSTOMER";

  return {
    id: user.id,
    email: user.email ?? "",
    role: validRole,
    fullName: user.user_metadata?.full_name ?? null,
    isBlocked: false,
  };
}

/**
 * Extrae el rol del usuario desde app_metadata o database
 */
async function getUserRole(
  userId: string,
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>
): Promise<string> {
  const { data } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("auth_user_id", userId)
    .single();

  const role = (data as { role: string | null } | null)?.role;

  return role ?? "ROLE_CUSTOMER";
}

// ============================================================================
// Operaciones de Autenticación
// ============================================================================

/**
 * Registra un nuevo usuario con email y password.
 *
 * @param credentials - Datos de registro
 * @returns Resultado de la operación
 */
export async function signUp(
  credentials: RegisterCredentials
): Promise<AuthResult> {
  const supabase = await createClient();

  const fullName = `${credentials.firstName} ${credentials.lastName}`;

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: {
        code: error.code ?? "auth/signup-failed",
        message: error.message,
      },
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: {
        code: "auth/no-user",
        message: "No se pudo crear el usuario",
      },
    };
  }

  // El rol por defecto es CUSTOMER para nuevos registros
  const sessionUser = await mapToSessionUser(data.user, "ROLE_CUSTOMER");

  return {
    success: true,
    user: sessionUser ?? undefined,
  };
}

/**
 * Inicia sesión con email y password.
 *
 * @param credentials - Credenciales de login
 * @returns Resultado con usuario y sesión
 */
export async function signIn(
  credentials: LoginCredentials
): Promise<AuthResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return {
      success: false,
      error: {
        code: error.code ?? "auth/invalid-credentials",
        message: error.message,
      },
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: {
        code: "auth/no-user",
        message: "No se pudo obtener el usuario",
      },
    };
  }

  // Obtener rol desde el perfil
  const serviceClient = await createServiceClient();
  const role = await getUserRole(data.user.id, serviceClient);
  const sessionUser = await mapToSessionUser(data.user, role);

  return {
    success: true,
    user: sessionUser ?? undefined,
  };
}

/**
 * Cierra la sesión del usuario actual.
 *
 * @returns Resultado de la operación
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: {
        code: error.code ?? "auth/signout-failed",
        message: error.message,
      },
    };
  }

  return { success: true };
}

/**
 * Solicita recuperación de contraseña.
 * Envía email con link de reset.
 *
 * @param request - Email del usuario
 * @returns Resultado de la operación
 */
export async function resetPassword(
  request: PasswordResetRequest
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=recovery`,
  });

  if (error) {
    return {
      success: false,
      error: {
        code: error.code ?? "auth/reset-failed",
        message: error.message,
      },
    };
  }

  return { success: true };
}

/**
 * Actualiza la contraseña del usuario.
 * Usado después de confirmar el recovery token.
 *
 * @param confirmation - Nueva contraseña
 * @returns Resultado de la operación
 */
export async function updatePassword(
  confirmation: PasswordResetConfirmation
): Promise<AuthResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: confirmation.password,
  });

  if (error) {
    return {
      success: false,
      error: {
        code: error.code ?? "auth/update-password-failed",
        message: error.message,
      },
    };
  }

  return { success: true };
}

// ============================================================================
// Gestión de Sesión
// ============================================================================

/**
 * Refresca la sesión actual.
 * Útil para mantener la sesión activa.
 *
 * @returns Sesión actualizada o null
 */
export async function refreshSession(): Promise<AuthSession | null> {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error || !session?.user) {
    return null;
  }

  // Obtener rol desde perfil
  const serviceClient = await createServiceClient();
  const role = await getUserRole(session.user.id, serviceClient);
  const sessionUser = await mapToSessionUser(session.user, role);

  if (!sessionUser) {
    return null;
  }

  return {
    user: sessionUser,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
  };
}

/**
 * Obtiene el usuario de la sesión actual.
 *
 * @returns Usuario de sesión o null si no hay sesión
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  // Obtener rol desde perfil
  const serviceClient = await createServiceClient();
  const role = await getUserRole(user.id, serviceClient);

  return mapToSessionUser(user, role);
}

/**
 * Obtiene la sesión completa del usuario actual.
 *
 * @returns Sesión completa o null
 */
export async function getSession(): Promise<AuthSession | null> {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session?.user) {
    return null;
  }

  // Obtener rol desde perfil
  const serviceClient = await createServiceClient();
  const role = await getUserRole(session.user.id, serviceClient);
  const sessionUser = await mapToSessionUser(session.user, role);

  if (!sessionUser) {
    return null;
  }

  return {
    user: sessionUser,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? 0,
  };
}
