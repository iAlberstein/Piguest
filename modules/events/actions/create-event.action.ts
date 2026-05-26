/**
 * Server Action: createEvent
 *
 * Crea un nuevo evento con todas sus relaciones:
 * - Evento base
 * - Sesiones (funciones/horarios)
 * - Sectores
 * - Tipos de ticket
 * - Etapas de venta (opcional)
 * - Servicios adicionales (opcional)
 * - Códigos promocionales (opcional)
 *
 * @module events/actions
 */

"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/modules/auth/guards/auth.guards";
import {
  createEventSchema,
  type CreateEventFormInput,
} from "@/modules/events/forms/event.schemas";

import type {
  Event,
  EventSession,
  EventSector,
  TicketType,
  EventResult,
} from "@/modules/events/types/event.types";

interface CreateEventResult extends EventResult {
  sessions?: EventSession[];
  sectors?: EventSector[];
  ticketTypes?: TicketType[];
}

export async function createEvent(
  input: CreateEventFormInput
): Promise<CreateEventResult> {
  try {
    // 1. Validar input con Zod
    const validation = createEventSchema.safeParse(input);
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

    // 2. Verificar autenticación y rol de productor
    const user = await requireAuth();
    if (!user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Debes iniciar sesión para crear eventos",
        },
      };
    }

    // 3. Verificar que el usuario es productor
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
          message: "Solo los productores pueden crear eventos",
        },
      };
    }

    // 4. Verificar que el slug no exista
    const { data: existingSlug } = await supabase
      .from("events")
      .select("id")
      .eq("slug", data.event.slug)
      .single();

    if (existingSlug) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_SLUG",
          message: "Ya existe un evento con este slug. Elige otro.",
        },
      };
    }

    // 5. Crear el evento base
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        producer_id: producer.id,
        title: data.event.title,
        slug: data.event.slug,
        description: data.event.description,
        short_description: data.event.shortDescription,
        event_type: data.event.eventType,
        duration_minutes: data.event.durationMinutes,
        age_rating: data.event.ageRating,
        poster_url: data.event.posterUrl,
        backdrop_url: data.event.backdropUrl,
        trailer_url: data.event.trailerUrl,
        status: "draft",
        is_active: true,
        is_featured: false,
      })
      .select()
      .single();

    if (eventError || !event) {
      return {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: "Error al crear el evento. Intenta nuevamente.",
        },
      };
    }

    const eventId = event.id;

    // 6. Crear sesiones
    const sessionsToInsert = data.sessions.map((session) => ({
      event_id: eventId,
      room_id: session.roomId,
      session_label: session.displayName,
      start_time: session.startsAt,
      end_time: session.endsAt,
      doors_open_at: session.accessStartsAt,
      sale_starts_at: session.saleStartsAt,
      sale_ends_at: session.saleEndsAt,
      status: "scheduled",
      is_active: true,
      total_capacity: session.totalCapacity,
      available_capacity: session.totalCapacity,
      sold_count: 0,
      reserved_count: 0,
    }));

    const { data: sessions, error: sessionsError } = await supabase
      .from("event_sessions")
      .insert(sessionsToInsert)
      .select();

    if (sessionsError) {
      // Rollback: eliminar evento
      await supabase.from("events").delete().eq("id", eventId);
      return {
        success: false,
        error: {
          code: "SESSIONS_ERROR",
          message: "Error al crear las sesiones. El evento no fue creado.",
        },
      };
    }

    // 7. Crear sectores
    const sectorsToInsert = data.sectors.map((sector) => ({
      event_id: eventId,
      name: sector.name,
      code: sector.code,
      sector_type: sector.sectorType,
      description: sector.description,
      seat_count: sector.seatCount,
      display_order: sector.displayOrder,
      color_code: sector.colorCode,
      is_active: true,
      is_numbered: sector.isNumbered,
    }));

    const { data: sectors, error: sectorsError } = await supabase
      .from("event_sectors")
      .insert(sectorsToInsert)
      .select();

    if (sectorsError) {
      // Rollback: eliminar evento y sesiones
      await supabase.from("event_sessions").delete().eq("event_id", eventId);
      await supabase.from("events").delete().eq("id", eventId);
      return {
        success: false,
        error: {
          code: "SECTORS_ERROR",
          message: "Error al crear los sectores. El evento no fue creado.",
        },
      };
    }

    // 8. Crear tipos de ticket
    const ticketTypesToInsert = data.ticketTypes.map((ticketType) => ({
      event_id: eventId,
      // sector_id se asigna después de crear sectores
      name: ticketType.name,
      description: ticketType.description,
      base_price: ticketType.basePrice,
      total_quantity: ticketType.totalQuantity,
      sold_quantity: 0,
      min_purchase: ticketType.minPurchase,
      max_purchase: ticketType.maxPurchase,
      is_visible: ticketType.isVisible,
      display_order: ticketType.displayOrder,
    }));

    const { data: ticketTypes, error: ticketTypesError } = await supabase
      .from("ticket_types")
      .insert(ticketTypesToInsert)
      .select();

    if (ticketTypesError) {
      // Rollback
      await supabase.from("event_sectors").delete().eq("event_id", eventId);
      await supabase.from("event_sessions").delete().eq("event_id", eventId);
      await supabase.from("events").delete().eq("id", eventId);
      return {
        success: false,
        error: {
          code: "TICKET_TYPES_ERROR",
          message: "Error al crear los tipos de ticket. El evento no fue creado.",
        },
      };
    }

    // 9. Crear etapas de venta (opcional)
    // NOTA: Las sale stages requieren ticket_type_id, se deben crear después
    // de establecer la relación entre ticket types y sale stages.
    // TODO: Implementar en una acción separada addSaleStage

    // 10. Crear servicios adicionales (opcional)
    if (data.additionalServices && data.additionalServices.length > 0) {
      const servicesToInsert = data.additionalServices.map((service) => ({
        event_id: eventId,
        name: service.name,
        description: service.description,
        price: service.price,
        is_limited: service.isLimited,
        total_quantity: service.totalQuantity,
        available_quantity: service.availableQuantity,
        is_optional: service.isOptional,
        is_active: true,
        max_per_ticket: service.maxPerTicket,
      }));

      const { error: servicesError } = await supabase
        .from("additional_services")
        .insert(servicesToInsert);

      if (servicesError) {
        console.error("Error creating additional services:", servicesError);
      }
    }

    // 11. Crear códigos promocionales (opcional)
    if (data.promoCodes && data.promoCodes.length > 0) {
      const promoCodesToInsert = data.promoCodes.map((promo) => ({
        event_id: eventId,
        producer_id: producer.id,
        code: promo.code,
        description: promo.description,
        discount_type: promo.discountType,
        discount_value: promo.discountValue,
        max_uses: promo.maxUses,
        uses_count: 0,
        max_uses_per_user: promo.maxUsesPerUser,
        starts_at: promo.startsAt,
        ends_at: promo.endsAt,
        applicable_ticket_types: promo.applicableTicketTypes,
        min_purchase_amount: promo.minPurchaseAmount,
        is_active: true,
      }));

      const { error: promoCodesError } = await supabase
        .from("promo_codes")
        .insert(promoCodesToInsert);

      if (promoCodesError) {
        console.error("Error creating promo codes:", promoCodesError);
      }
    }

    // 12. Revalidar caché
    revalidatePath("/producer/events");
    revalidatePath(`/event/${data.event.slug}`);

    return {
      success: true,
      event: event as Event,
      sessions: (sessions || []) as EventSession[],
      sectors: (sectors || []) as EventSector[],
      ticketTypes: (ticketTypes || []) as TicketType[],
    };
  } catch (error) {
    console.error("createEvent error:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Error interno del servidor. Intenta nuevamente.",
      },
    };
  }
}
