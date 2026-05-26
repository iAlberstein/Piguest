import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/supabase";

/**
 * Crea un cliente Supabase para uso en el navegador (client-side).
 * Utiliza el patrón singleton para reutilizar la misma instancia.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Instancia singleton del cliente Supabase para el navegador.
 * Se recomienda usar esta instancia en componentes y hooks.
 */
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseClient() solo debe usarse en el cliente. " +
      "Para server-side, usar /lib/supabase/server.ts"
    );
  }

  if (!browserClient) {
    browserClient = createClient();
  }

  return browserClient;
}
