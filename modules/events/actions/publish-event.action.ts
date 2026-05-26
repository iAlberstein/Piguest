/**
 * Server Action: publishEvent
 *
 * Publica un evento en estado draft:
 * - Cambia status a 'published'
 * - Establece published_at
 * - Valida que tenga al menos una sesión futura
 *
 * @module events/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";

import type { Event, EventResult } from "@/modules/events/types/event.types";

interface PublishEventResult extends EventResult {
  event?: Event;
}

export async function publishEvent(eventId: string): Promise<PublishEventResult> {
  try {
    // 1. Verificar autenticación
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Debes iniciar sesión para publicar eventos",
        },
      };
    }

    // 2. Verificar ownership
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*, producers!inner(profile_id), event_sessions(*)")
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
          message: "No tienes permiso para publicar este evento",
        },
      };
    }

    // 3. Validar que está en draft
    if (event.status !== "draft") {
      return {
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Solo se pueden publicar eventos en estado borrador",
        },
      };
    }

    // 4. Validar que tiene sesiones futuras
    const sessions = event.event_sessions as Array<{ start_time: string }>;
    const now = new Date();
    const hasFutureSessions = sessions.some(
      (s) => new Date(s.start_time) > now
    );

    if (!hasFutureSessions) {
      return {
        success: false,
        error: {
          code: "NO_FUTURE_SESSIONS",
          message: "El evento debe tener al menos una sesión futura para publicarse",
        },
      };
    }

    // 5. Publicar evento
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError || !updatedEvent) {
      return {
        success: false,
        error: {
          code: "PUBLISH_ERROR",
          message: "Error al publicar el evento",
        },
      };
    }

    // 6. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/event/${updatedEvent.slug}`);

    return {
      success: true,
      event: updatedEvent as Event,
    };
  } catch (error) {
    console.error("publishEvent error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}
