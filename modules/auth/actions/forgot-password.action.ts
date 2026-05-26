"use server";

/**
 * Server Action para solicitar recuperación de contraseña.
 *
 * Envía email de recovery mediante Supabase Auth.
 */

import { createClient } from "@/lib/supabase/server";

import { forgotPasswordSchema } from "../forms/forgot-password.schema";

import type { AuthResult } from "../types/auth.types";

/**
 * Solicita envío de email para recuperación de contraseña.
 *
 * @param email - Email del usuario
 * @returns Resultado de la operación
 */
export async function forgotPasswordAction(email: string): Promise<AuthResult> {
  try {
    // Validar email
    const validationResult = forgotPasswordSchema.safeParse({ email });

    if (!validationResult.success) {
      return {
        success: false,
        error: {
          code: "validation/error",
          message: "Email inválido",
        },
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
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

    // Intentar registrar evento de auditoría (no bloqueante)
    // Nota: no tenemos userId aquí, solo email
    // El log completo se hará cuando el usuario confirme el reset
    try {
      // No podemos loguear sin userId, pero registramos intento anónimo
      // para analytics (email solo para debugging)
      console.log("Password reset requested for:", email);
    } catch {
      // Ignorar errores de logging
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "auth/unknown-error",
        message:
          error instanceof Error
            ? error.message
            : "Error al solicitar recuperación",
      },
    };
  }
}
