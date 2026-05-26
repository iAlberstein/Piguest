"use server";

/**
 * Server Action para autenticación OAuth.
 *
 * Inicia el flujo OAuth con providers externos (Google, Apple).
 */

import { createClient } from "@/lib/supabase/server";

import type { AuthResult, OAuthProvider } from "../types/auth.types";

/**
 * Inicia el flujo de autenticación OAuth.
 *
 * @param provider - Provider OAuth (google, apple)
 * @param redirectTo - URL de retorno después del OAuth
 * @returns URL para redirigir al usuario al provider
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo: string = "/"
): Promise<AuthResult & { url?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?type=oauth&redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      return {
        success: false,
        error: {
          code: error.code ?? "oauth/failed",
          message: error.message,
        },
      };
    }

    if (!data.url) {
      return {
        success: false,
        error: {
          code: "oauth/no-url",
          message: "No se pudo obtener la URL de autorización",
        },
      };
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "oauth/unknown-error",
        message:
          error instanceof Error
            ? error.message
            : "Error desconocido en OAuth",
      },
    };
  }
}
