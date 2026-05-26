"use server";

/**
 * Server Action para confirmar nuevo password.
 *
 * Actualiza la contraseña del usuario autenticado.
 */

import { createClient } from "@/lib/supabase/server";

import { resetPasswordSchema } from "../forms/forgot-password.schema";

import type { AuthResult } from "../types/auth.types";

/**
 * Actualiza la contraseña del usuario.
 *
 * @param password - Nueva contraseña
 * @param confirmPassword - Confirmación de contraseña
 * @returns Resultado de la operación
 */
export async function resetPasswordAction(
  password: string,
  confirmPassword: string
): Promise<AuthResult> {
  try {
    // Validar passwords
    const validationResult = resetPasswordSchema.safeParse({
      password,
      confirmPassword,
    });

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        (issue) => `${(issue.path as string[]).join(".")}: ${issue.message}`
      );

      return {
        success: false,
        error: {
          code: "validation/error",
          message: errors.join("; "),
        },
      };
    }

    const supabase = await createClient();

    // Verificar que hay sesión activa (el usuario accedió via recovery link)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return {
        success: false,
        error: {
          code: "auth/no-session",
          message: "Sesión no válida. Solicitá un nuevo link de recuperación.",
        },
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: validationResult.data.password,
    });

    if (error) {
      return {
        success: false,
        error: {
          code: error.code ?? "auth/update-failed",
          message: error.message,
        },
      };
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
            : "Error al actualizar contraseña",
      },
    };
  }
}
