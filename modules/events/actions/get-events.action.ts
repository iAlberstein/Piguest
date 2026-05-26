/**
 * Server Actions: Get Events
 *
 * Acciones para obtener eventos:
 * - getEventBySlug: Obtener evento por slug (público)
 * - getProducerEvents: Listar eventos del productor
 * - getPublicEvents: Listar eventos públicos
 *
 * @module events/actions
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";

import type {
  Event,
  EventSession,
  EventSector,
  TicketType,
  EventListResult,
} from "@/modules/events/types/event.types";

interface GetEventResult {
  success: boolean;
  event?: Event & {
    sessions?: EventSession[];
    sectors?: EventSector[];
    ticketTypes?: TicketType[];
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Obtiene un evento por su slug.
 * Incluye sesiones, sectores y tipos de ticket.
 * Público: cualquiera puede ver eventos publicados.
 */
export async function getEventBySlug(slug: string): Promise<GetEventResult> {
  try {
    const supabase = await createClient();

    // Obtener evento con relaciones
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
        *,
        producers (id, business_name),
        event_sessions (*),
        event_sectors (*),
        ticket_types (*)
      `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !event) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Evento no encontrado",
        },
      };
    }

    // Solo mostrar eventos publicados al público
    if (event.status !== "published" && event.status !== "on_sale" && event.status !== "sold_out") {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Evento no encontrado",
        },
      };
    }

    return {
      success: true,
      event: {
        ...(event as Event),
        sessions: (event.event_sessions || []) as EventSession[],
        sectors: (event.event_sectors || []) as EventSector[],
        ticketTypes: (event.ticket_types || []) as TicketType[],
      },
    };
  } catch (error) {
    console.error("getEventBySlug error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}

interface GetProducerEventsResult extends EventListResult {
  events?: (Event & {
    sessionCount?: number;
    soldTickets?: number;
  })[];
}

/**
 * Obtiene todos los eventos del productor autenticado.
 * Incluye borradores, publicados, cancelados.
 */
export async function getProducerEvents(): Promise<GetProducerEventsResult> {
  try {
    // 1. Verificar autenticación
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Debes iniciar sesión",
        },
      };
    }

    // 2. Obtener producer_id
    const supabase = await createClient();
    const { data: producer, error: producerError } = await supabase
      .from("producers")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (producerError || !producer) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "No eres productor",
        },
      };
    }

    // 3. Obtener eventos con conteos
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        *,
        event_sessions (id, status, sold_count),
        event_sectors (id),
        ticket_types (id)
      `
      )
      .eq("producer_id", producer.id)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        error: {
          code: "QUERY_ERROR",
          message: "Error al obtener eventos",
        },
      };
    }

    // 4. Calcular conteos
    const eventsWithCounts = (events || []).map((event) => {
      const sessions = (event.event_sessions || []) as Array<{
        status: string;
        sold_count: number;
      }>;
      const sessionCount = sessions.length;
      const soldTickets = sessions.reduce((sum, s) => sum + (s.sold_count || 0), 0);

      return {
        ...(event as Event),
        sessionCount,
        soldTickets,
      };
    });

    return {
      success: true,
      events: eventsWithCounts,
      count: eventsWithCounts.length,
    };
  } catch (error) {
    console.error("getProducerEvents error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}

interface GetPublicEventsResult extends EventListResult {
  events?: (Event & {
    producerName?: string;
    nextSession?: string;
  })[];
}

/**
 * Obtiene eventos públicos disponibles para compra.
 * Solo eventos publicados, on_sale o sold_out.
 * Ordenados por fecha de próxima sesión.
 */
export async function getPublicEvents(): Promise<GetPublicEventsResult> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Obtener eventos publicados con próximas sesiones
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        *,
        producers (business_name),
        event_sessions!inner (start_time)
      `
      )
      .eq("is_active", true)
      .in("status", ["published", "on_sale", "sold_out"])
      .gte("event_sessions.start_time", now)
      .order("event_sessions.start_time", { ascending: true });

    if (error) {
      return {
        success: false,
        error: {
          code: "QUERY_ERROR",
          message: "Error al obtener eventos",
        },
      };
    }

    // Formatear resultados
    const formattedEvents = (events || []).map((event) => {
      const producer = event.producers as { business_name: string };
      const sessions = (event.event_sessions || []) as Array<{
        start_time: string;
      }>;
      const nextSession = sessions[0]?.start_time;

      return {
        ...(event as Event),
        producerName: producer?.business_name,
        nextSession,
      };
    });

    return {
      success: true,
      events: formattedEvents,
      count: formattedEvents.length,
    };
  } catch (error) {
    console.error("getPublicEvents error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}
