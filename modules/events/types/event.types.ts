/**
 * Tipos de dominio para el módulo de Eventos.
 *
 * TODOS los tipos se derivan EXCLUSIVAMENTE de /types/supabase.ts.
 * NO se definen entidades manualmente - se reutilizan los tipos de Supabase.
 *
 * Las entidades principales mapean a las tablas de la base de datos:
 * - events → Event
 * - event_sessions → EventSession (funciones, horarios, días, jornadas)
 * - event_sectors → EventSector (platea, palcos, pullman)
 * - ticket_types → TicketType
 * - sale_stages → SaleStage (etapas de venta con precios diferenciados)
 * - additional_services → AdditionalService (servicios adicionales)
 * - promo_codes → PromoCode (códigos de descuento)
 *
 * @module events/types
 * @see /types/supabase.ts
 */

import type { Database } from "@/types/supabase";

// ============================================================================
// Tipos Base de Supabase (Reutilización directa)
// ============================================================================

/**
 * Helper type para extraer Row types de tablas de Supabase.
 */
type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// ============================================================================
// Entidades Principales (Derivadas de Supabase)
// ============================================================================

/**
 * Evento (Espectáculo).
 * Mapea directamente a la tabla 'events' en Supabase.
 */
export type Event = Tables<"events">;

/**
 * Sesión de Evento (Función, Horario, Día, Jornada).
 * Mapea directamente a la tabla 'event_sessions' en Supabase.
 *
 * NOTA: Reemplaza conceptualmente 'event_dates'.
 * Una EventSession representa UNA ocurrencia específica del evento
 * (ej: "Función del sábado 15 de junio a las 20:00").
 */
export type EventSession = Tables<"event_sessions">;

/**
 * Sector de Evento (Sección de butacas).
 * Mapea directamente a la tabla 'event_sectors' en Supabase.
 *
 * Representa: Platea, Palcos Bajos, Palcos Altos, Pullman.
 */
export type EventSector = Tables<"event_sectors">;

/**
 * Tipo de Ticket.
 * Mapea directamente a la tabla 'ticket_types' en Supabase.
 */
export type TicketType = Tables<"ticket_types">;

/**
 * Etapa de Venta (Sale Stage).
 * Mapea directamente a la tabla 'sale_stages' en Supabase.
 *
 * Permite definir precios diferenciados por etapas:
 * - Preventa (early bird)
 * - Venta general
 * - Últimos tickets
 */
export type SaleStage = Tables<"sale_stages">;

/**
 * Servicio Adicional.
 * Mapea directamente a la tabla 'additional_services' en Supabase.
 *
 * Ej: Estacionamiento, consumición, merch, etc.
 */
export type AdditionalService = Tables<"additional_services">;

/**
 * Código de Descuento (Promo Code).
 * Mapea directamente a la tabla 'promo_codes' en Supabase.
 */
export type PromoCode = Tables<"promo_codes">;

// ============================================================================
// Tipos para Inserción (Create)
// ============================================================================

export type CreateEventInput = TablesInsert<"events">;
export type CreateEventSessionInput = TablesInsert<"event_sessions">;
export type CreateEventSectorInput = TablesInsert<"event_sectors">;
export type CreateTicketTypeInput = TablesInsert<"ticket_types">;
export type CreateSaleStageInput = TablesInsert<"sale_stages">;
export type CreateAdditionalServiceInput = TablesInsert<"additional_services">;
export type CreatePromoCodeInput = TablesInsert<"promo_codes">;

// ============================================================================
// Tipos para Actualización (Update)
// ============================================================================

export type UpdateEventInput = TablesUpdate<"events">;
export type UpdateEventSessionInput = TablesUpdate<"event_sessions">;
export type UpdateEventSectorInput = TablesUpdate<"event_sectors">;
export type UpdateTicketTypeInput = TablesUpdate<"ticket_types">;
export type UpdateSaleStageInput = TablesUpdate<"sale_stages">;
export type UpdateAdditionalServiceInput = TablesUpdate<"additional_services">;
export type UpdatePromoCodeInput = TablesUpdate<"promo_codes">;

// ============================================================================
// Relaciones y Entidades Extendidas
// ============================================================================

/**
 * Evento con sus sesiones (funciones/horarios).
 * Un Event tiene múltiples EventSessions.
 */
export interface EventWithSessions extends Event {
  sessions: EventSession[];
}

/**
 * Evento con información completa del productor.
 */
export interface EventWithProducer extends Event {
  producer: Tables<"producers">;
}

/**
 * Sesión con información completa del evento y sectores disponibles.
 */
export interface EventSessionFull extends EventSession {
  event: Event;
  sectors: (EventSector & { ticketTypes: TicketType[] })[];
}

/**
 * Sector con sus tipos de ticket y precios.
 */
export interface EventSectorWithTicketTypes extends EventSector {
  ticketTypes: (TicketType & { saleStages: SaleStage[] })[];
}

// ============================================================================
// Enums (Extraídos de Supabase)
// ============================================================================

/**
 * Estados de evento (si están definidos como enum en Supabase).
 * Si no existen como enum, se manejan como string con type safety.
 */
export type EventStatus =
  | "draft"
  | "published"
  | "on_sale"
  | "sold_out"
  | "cancelled"
  | "completed";

export type EventSessionStatus =
  | "scheduled"
  | "on_sale"
  | "sold_out"
  | "cancelled"
  | "completed";

/**
 * Tipos de sectores soportados.
 */
export type EventSectorType =
  | "platea"
  | "palcos_bajos"
  | "palcos_altos"
  | "pullman";

// ============================================================================
// Resultados de Operaciones
// ============================================================================

export interface EventResult {
  success: boolean;
  event?: Event;
  error?: {
    code: string;
    message: string;
  };
}

export interface EventSessionResult {
  success: boolean;
  session?: EventSession;
  error?: {
    code: string;
    message: string;
  };
}

export interface EventListResult {
  success: boolean;
  events?: Event[];
  count?: number;
  error?: {
    code: string;
    message: string;
  };
}

