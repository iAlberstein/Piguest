/**
 * Server Action: unhideEvent
 *
 * Desoculta un evento (is_active = true).
 * Vuelve a hacerlo visible públicamente.
 *
 * @module events/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";

import type { Event, EventResult } from "@/modules/events/types/event.types";

interface UnhideEventResult extends EventResult {
  event?: Event;
}

export async function unhideEvent(eventId: string): Promise<UnhideEventResult> {
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
          message: "No tienes permiso",
        },
      };
    }

    // 3. Desocultar evento
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({ is_active: true })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError || !updatedEvent) {
      return {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: "Error al desocultar el evento",
        },
      };
    }

    // 4. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/event/${updatedEvent.slug}`);

    return {
      success: true,
      event: updatedEvent as Event,
    };
  } catch (error) {
    console.error("unhideEvent error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}
