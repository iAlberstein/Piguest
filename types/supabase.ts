/**
 * Tipos generados de la base de datos Supabase.
 * Este archivo debe actualizarse con los tipos reales de la DB usando:
 * npx supabase gen types typescript --project-id <project-id> --schema public > types/supabase.ts
 *
 * Por ahora, se define una interfaz placeholder que puede extenderse
 * conforme se definen las tablas en Supabase.
 */
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
