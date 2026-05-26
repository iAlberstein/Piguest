/**
 * Server Action: cancelEvent
 *
 * Cancela un evento:
 * - Cambia status a 'cancelled'
 * - Cancela todas las sesiones futuras
 * - Notifica a los compradores (TODO)
 *
 * @module events/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";

import type { Event, EventResult } from "@/modules/events/types/event.types";

interface CancelEventResult extends EventResult {
  event?: Event;
}

export async function cancelEvent(
  eventId: string,
  reason?: string
): Promise<CancelEventResult> {
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

    // 2. Verificar ownership
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*, producers!inner(profile_id)")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Evento no encontrado",
        },
      };
    }

    const producerProfileId = (event.producers as { profile_id: string }).profile_id;
    if (producerProfileId !== user.id) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "No tienes permiso para cancelar este evento",
        },
      };
    }

    // 3. Validar que no está ya cancelado o completado
    if (event.status === "cancelled") {
      return {
        success: false,
        error: {
          code: "ALREADY_CANCELLED",
          message: "El evento ya está cancelado",
        },
      };
    }

    if (event.status === "completed") {
      return {
        success: false,
        error: {
          code: "ALREADY_COMPLETED",
          message: "No se puede cancelar un evento finalizado",
        },
      };
    }

    // 4. Cancelar evento y sesiones futuras
    const now = new Date().toISOString();

    // Cancelar evento
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({ status: "cancelled" })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError || !updatedEvent) {
      return {
        success: false,
        error: {
          code: "CANCEL_ERROR",
          message: "Error al cancelar el evento",
        },
      };
    }

    // Cancelar sesiones futuras
    await supabase
      .from("event_sessions")
      .update({ status: "cancelled" })
      .eq("event_id", eventId)
      .gt("start_time", now);

    // 5. TODO: Notificar a compradores
    console.log("Event cancelled, reason:", reason);

    // 6. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/event/${updatedEvent.slug}`);

    return {
      success: true,
      event: updatedEvent as Event,
    };
  } catch (error) {
    console.error("cancelEvent error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}
