"use server";

/**
 * Server Action para login de usuarios.
 *
 * Responsabilidades:
 * - Validar datos con zod schema
 * - Autenticar con Supabase Auth
 * - Establecer sesión via cookies
 * - Manejo centralizado de errores
 */

import { createClient } from "@/lib/supabase/server";

import {
  formatAuthError,
  formatValidationErrors,
} from "../errors/auth-errors";
import { loginSchema } from "../forms/login.schema";
import { logLogin } from "../helpers/audit.helper";
import {
  isAuthRole,
  type AuthResult,
  type LoginCredentials,
} from "../types/auth.types";

/**
 * Autentica un usuario con email y password.
 *
 * @param credentials - Credenciales de login
 * @returns Resultado de la operación con usuario y sesión
 */
export async function loginAction(
  credentials: LoginCredentials
): Promise<AuthResult> {
  try {
    // 1. Validar datos con schema
    const validationResult = loginSchema.safeParse(credentials);

    if (!validationResult.success) {
      return formatValidationErrors(
        validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    const validatedData = validationResult.data;

    // 2. Autenticar con Supabase
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error || !data.user) {
      // Mapear error de Supabase a mensaje seguro (no leak info)
      console.error("Login error:", error); // Log técnico interno
      return formatAuthError(error);
    }

    // 3. Obtener rol desde user_metadata o default
    const userMetadata = data.user.user_metadata as
      | { role?: string; full_name?: string }
      | undefined;
    const role = userMetadata?.role ?? "ROLE_CUSTOMER";
    const validRole = isAuthRole(role) ? role : "ROLE_CUSTOMER";

    // Registrar evento de auditoría (no bloqueante)
    void logLogin(
      data.user.id,
      data.user.email ?? "",
      validRole,
      "password"
    );

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        role: validRole,
        fullName: userMetadata?.full_name ?? null,
        isBlocked: false,
      },
    };
  } catch (error) {
    // Error inesperado - mapear a mensaje genérico seguro
    console.error("Unexpected login error:", error);
    return formatAuthError(error);
  }
}
