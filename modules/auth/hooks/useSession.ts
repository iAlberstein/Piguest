"use client";

/**
 * Hook para acceder a la sesión del usuario en Client Components.
 *
 * ⚠️ IMPORTANTE:
 * - Este hook SOLO funciona en Client Components ("use client")
 * - Para Server Components, usar directamente `createClient()` de `/lib/supabase/server`
 * - NO usar localStorage - todas las sesiones se manejan via cookies httpOnly
 *
 * @see https://supabase.com/docs/guides/auth/server-side/nextjs
 */

import { useCallback, useEffect, useState } from "react";

import { getSupabaseClient } from "@/lib/supabase/client";

import type { SessionUser } from "../types/auth.types";

interface UseSessionReturn {
  user: SessionUser | null;
  isLoading: boolean;
  error: Error | null;
  refreshSession: () => Promise<void>;
}

/**
 * Hook para obtener la sesión actual del usuario.
 *
 * Ejemplo:
 * ```tsx
 * "use client";
 * import { useSession } from "@/modules/auth/hooks/useSession";
 *
 * export function UserProfile() {
 *   const { user, isLoading } = useSession();
 *
 *   if (isLoading) return <div>Cargando...</div>;
 *   if (!user) return <div>No autenticado</div>;
 *
 *   return <div>Hola {user.fullName}</div>;
 * }
 * ```
 */
export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = getSupabaseClient();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.user) {
        setUser(null);
        return;
      }

      // Mapear usuario de Supabase a SessionUser
      const userMetadata = session.user.user_metadata as
        | { full_name?: string; role?: string }
        | undefined;

      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        role: (userMetadata?.role as SessionUser["role"]) ?? "ROLE_CUSTOMER",
        fullName: userMetadata?.full_name ?? null,
        isBlocked: false,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cargar sesión inicial
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession();

    // Suscribirse a cambios de autenticación
    const supabase = getSupabaseClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        return;
      }

      const userMetadata = session.user.user_metadata as
        | { full_name?: string; role?: string }
        | undefined;

      setUser({
        id: session.user.id,
        email: session.user.email ?? "",
        role: (userMetadata?.role as SessionUser["role"]) ?? "ROLE_CUSTOMER",
        fullName: userMetadata?.full_name ?? null,
        isBlocked: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  return {
    user,
    isLoading,
    error,
    refreshSession,
  };
}
