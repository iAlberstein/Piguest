/**
 * Server Action: updateEvent
 *
 * Actualiza un evento existente y sus relaciones.
 * Solo permite modificar eventos del productor autenticado.
 * NO permite modificar sesiones pasadas (solo futuras).
 *
 * @module events/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";
import { eventBaseSchema } from "@/modules/events/forms/event.schemas";

import type {
  Event,
  UpdateEventInput,
  EventResult,
} from "@/modules/events/types/event.types";

interface UpdateEventResult extends EventResult {
  event?: Event;
}

export async function updateEvent(
  eventId: string,
  input: Partial<UpdateEventInput>
): Promise<UpdateEventResult> {
  try {
    // 1. Verificar autenticación
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Debes iniciar sesión para actualizar eventos",
        },
      };
    }

    // 2. Verificar ownership del evento
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

    // Verificar que el productor es el dueño
    const producerProfileId = (event.producers as { profile_id: string }).profile_id;
    if (producerProfileId !== user.id) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "No tienes permiso para modificar este evento",
        },
      };
    }

    // 3. Validar input
    const validation = eventBaseSchema.partial().safeParse(input);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: validation.error.issues.map((i) => i.message).join(", "),
        },
      };
    }

    const data = validation.data;

    // 4. Verificar slug único si se está cambiando
    if (data.slug && data.slug !== event.slug) {
      const { data: existingSlug } = await supabase
        .from("events")
        .select("id")
        .eq("slug", data.slug)
        .neq("id", eventId)
        .single();

      if (existingSlug) {
        return {
          success: false,
          error: {
            code: "DUPLICATE_SLUG",
            message: "Ya existe otro evento con este slug",
          },
        };
      }
    }

    // 5. Construir objeto de actualización
    const updateData = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.shortDescription !== undefined && { short_description: data.shortDescription }),
      ...(data.eventType !== undefined && { event_type: data.eventType }),
      ...(data.durationMinutes !== undefined && { duration_minutes: data.durationMinutes }),
      ...(data.ageRating !== undefined && { age_rating: data.ageRating }),
      ...(data.posterUrl !== undefined && { poster_url: data.posterUrl }),
      ...(data.backdropUrl !== undefined && { backdrop_url: data.backdropUrl }),
      ...(data.trailerUrl !== undefined && { trailer_url: data.trailerUrl }),
    };

    // 6. Actualizar evento
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .select()
      .single();

    if (updateError || !updatedEvent) {
      return {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: "Error al actualizar el evento",
        },
      };
    }

    // 7. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/producer/events/${eventId}`);
    revalidatePath(`/event/${updatedEvent.slug}`);
    if (event.slug !== updatedEvent.slug) {
      revalidatePath(`/event/${event.slug}`);
    }

    return {
      success: true,
      event: updatedEvent as Event,
    };
  } catch (error) {
    console.error("updateEvent error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}
