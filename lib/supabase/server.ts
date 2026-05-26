import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/supabase";

/**
 * Crea un cliente Supabase para uso en Server Components,
 * Server Actions y Route Handlers de Next.js App Router.
 *
 * Este cliente maneja automáticamente las cookies de sesión
 * utilizando la API de cookies de Next.js.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // En Server Components, no se pueden modificar cookies
            // después de que el componente ha renderizado.
            // El error se maneja silenciosamente en este caso.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Mismo caso que set - silenciamos el error en Server Components
          }
        },
      },
    }
  );
}

/**
 * Crea un cliente Supabase con service role key para operaciones
 * administrativas que requieren privilegios elevados.
 *
 * ⚠️ SOLO USAR EN CONTEXTO SEGURO (Server Actions protegidas, API routes con auth)
 */
export async function createServiceClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Silenciar error en Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // Silenciar error en Server Components
          }
        },
      },
    }
  );
}
