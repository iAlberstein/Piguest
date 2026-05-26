/**
 * Server Actions: Event Session Management
 *
 * Acciones para gestionar sesiones (funciones) de eventos:
 * - addEventSession: Agregar nueva sesión
 * - updateEventSession: Actualizar sesión existente
 * - removeEventSession: Eliminar sesión (solo si no tiene ventas)
 *
 * @module events/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";
import {
  eventSessionSchema,
  type EventSessionInput,
} from "@/modules/events/forms/event.schemas";

import type {
  EventSession,
  EventSessionResult,
} from "@/modules/events/types/event.types";

interface AddSessionResult extends EventSessionResult {
  session?: EventSession;
}

/**
 * Agrega una nueva sesión a un evento existente.
 * Permite agregar sesiones incluso después de publicar el evento.
 */
export async function addEventSession(
  eventId: string,
  input: EventSessionInput
): Promise<AddSessionResult> {
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

    // 3. Validar input
    const validation = eventSessionSchema.safeParse(input);
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

    // 4. Crear sesión
    const { data: session, error: insertError } = await supabase
      .from("event_sessions")
      .insert({
        event_id: eventId,
        room_id: data.roomId,
        session_label: data.displayName,
        start_time: data.startsAt,
        end_time: data.endsAt,
        doors_open_at: data.accessStartsAt,
        sale_starts_at: data.saleStartsAt,
        sale_ends_at: data.saleEndsAt,
        status: "scheduled",
        is_active: true,
        total_capacity: data.totalCapacity,
        available_capacity: data.totalCapacity,
        sold_count: 0,
        reserved_count: 0,
      })
      .select()
      .single();

    if (insertError || !session) {
      return {
        success: false,
        error: {
          code: "INSERT_ERROR",
          message: "Error al crear la sesión",
        },
      };
    }

    // 5. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/producer/events/${eventId}`);
    revalidatePath(`/event/${event.slug}`);

    return {
      success: true,
      session: session as EventSession,
    };
  } catch (error) {
    console.error("addEventSession error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}

/**
 * Actualiza una sesión existente.
 * Solo permite modificar sesiones futuras.
 */
export async function updateEventSession(
  sessionId: string,
  input: Partial<EventSessionInput>
): Promise<AddSessionResult> {
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

    // 2. Obtener sesión y verificar ownership
    const supabase = await createClient();
    const { data: session, error: sessionError } = await supabase
      .from("event_sessions")
      .select("*, events!inner(id, slug, producers!inner(profile_id))")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sesión no encontrada",
        },
      };
    }

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const sessionData = session as any;
    const event = sessionData.events as {
      slug: string;
      producers: { profile_id: string };
    };
    if (event.producers.profile_id !== user.id) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "No tienes permiso",
        },
      };
    }

    // 3. Validar que la sesión es futura
    const sessionStart = new Date(sessionData.start_time as string);
    if (sessionStart <= new Date()) {
      return {
        success: false,
        error: {
          code: "PAST_SESSION",
          message: "No se pueden modificar sesiones pasadas o en curso",
        },
      };
    }

    // 4. Construir update
    const updateData: any = {};
    if (input.displayName !== undefined) updateData.session_label = input.displayName;
    if (input.startsAt !== undefined) updateData.start_time = input.startsAt;
    if (input.endsAt !== undefined) updateData.end_time = input.endsAt;
    if (input.accessStartsAt !== undefined) updateData.doors_open_at = input.accessStartsAt;
    if (input.saleStartsAt !== undefined) updateData.sale_starts_at = input.saleStartsAt;
    if (input.saleEndsAt !== undefined) updateData.sale_ends_at = input.saleEndsAt;
    if (input.totalCapacity !== undefined) {
      updateData.total_capacity = input.totalCapacity;
      // Recalcular available si aumenta capacidad
      const sold = (sessionData.sold_count as number) || 0;
      updateData.available_capacity = input.totalCapacity - sold;
    }
    if (input.roomId !== undefined) updateData.room_id = input.roomId;

    // 5. Actualizar
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const { data: updatedSession, error: updateError } = await supabase
      .from("event_sessions")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updateData as any)
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError || !updatedSession) {
      return {
        success: false,
        error: {
          code: "UPDATE_ERROR",
          message: "Error al actualizar la sesión",
        },
      };
    }

    // 6. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/event/${event.slug}`);

    return {
      success: true,
      session: updatedSession as EventSession,
    };
  } catch (error) {
    console.error("updateEventSession error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}

/**
 * Elimina una sesión.
 * Solo permite eliminar sesiones sin ventas.
 */
export async function removeEventSession(
  sessionId: string
): Promise<{ success: boolean; error?: { code: string; message: string } }> {
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

    // 2. Obtener sesión y verificar ownership
    const supabase = await createClient();
    const { data: session, error: sessionError } = await supabase
      .from("event_sessions")
      .select("*, events!inner(id, slug, producers!inner(profile_id))")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sesión no encontrada",
        },
      };
    }

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    const sessionData = session as any;
    const event = sessionData.events as {
      id: string;
      slug: string;
      producers: { profile_id: string };
    };
    if (event.producers.profile_id !== user.id) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "No tienes permiso",
        },
      };
    }

    // 3. Verificar que no tiene ventas
    const soldCount = (sessionData.sold_count as number) || 0;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
    if (soldCount > 0) {
      return {
        success: false,
        error: {
          code: "HAS_SALES",
          message: "No se puede eliminar una sesión con entradas vendidas",
        },
      };
    }

    // 4. Eliminar
    const { error: deleteError } = await supabase
      .from("event_sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) {
      return {
        success: false,
        error: {
          code: "DELETE_ERROR",
          message: "Error al eliminar la sesión",
        },
      };
    }

    // 5. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/producer/events/${event.id}`);
    revalidatePath(`/event/${event.slug}`);

    return { success: true };
  } catch (error) {
    console.error("removeEventSession error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor",
      },
    };
  }
}
