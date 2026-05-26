/**
 * Schemas Zod para validación de Eventos.
 *
 * Validaciones para:
 * - Eventos (title, slug, descriptions)
 * - Sesiones (funciones/horarios)
 * - Sectores (platea, palcos, pullman)
 * - Tipos de ticket
 * - Etapas de venta (preventas)
 * - Servicios adicionales
 * - Códigos promocionales
 *
 * @module events/forms
 */

import { z } from "zod";

// ============================================================================
// Constantes de Validación
// ============================================================================

const MAX_PURCHASE_PER_ORDER = 6;
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 255;
const MAX_SLUG_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_SHORT_DESCRIPTION_LENGTH = 500;
const MAX_SESSION_LABEL_LENGTH = 100;
const MAX_SECTOR_NAME_LENGTH = 100;
const MAX_TICKET_TYPE_NAME_LENGTH = 100;
const MAX_SERVICE_NAME_LENGTH = 100;
const MAX_PROMO_CODE_LENGTH = 50;

const EVENT_TYPES = [
  "theater",
  "concert",
  "comedy",
  "dance",
  "opera",
  "musical",
  "workshop",
  "festival",
  "other",
] as const;

const EVENT_TYPES_MESSAGE = "Tipo de evento inválido";

const EVENT_STATUS = [
  "draft",
  "published",
  "on_sale",
  "sold_out",
  "cancelled",
  "completed",
] as const;

const SESSION_STATUS = [
  "scheduled",
  "on_sale",
  "sold_out",
  "cancelled",
  "completed",
] as const;

const SECTOR_TYPES = [
  "platea",
  "palcos_bajos",
  "palcos_altos",
  "pullman",
  "vip",
  "general",
] as const;

const SECTOR_TYPE_MESSAGE = "Tipo de sector inválido";

const DISCOUNT_TYPES = ["percentage", "fixed_amount"] as const;

const DISCOUNT_TYPE_MESSAGE = "Tipo de descuento inválido";

// ============================================================================
// Helpers de Validación
// ============================================================================

const slugSchema = z
  .string()
  .min(1, "El slug es obligatorio")
  .max(MAX_SLUG_LENGTH, `Máximo ${MAX_SLUG_LENGTH} caracteres`)
  .regex(
    /^[a-z0-9-]+$/,
    "Solo letras minúsculas, números y guiones"
  )
  .regex(
    /^[a-z0-9].*[a-z0-9]$/,
    "No puede empezar ni terminar con guión"
  );

const priceSchema = z
  .number()
  .min(0, "El precio no puede ser negativo")
  .max(999999.99, "Precio máximo excedido");

const quantitySchema = z
  .number()
  .int("Debe ser un número entero")
  .min(0, "La cantidad no puede ser negativa");

const positiveIntSchema = z
  .number()
  .int("Debe ser un número entero")
  .positive("Debe ser mayor a 0");

const timestampSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  "Fecha/hora inválida (ISO 8601 requerido)"
);

// ============================================================================
// Schema: Evento Base
// ============================================================================

export const eventBaseSchema = z.object({
  title: z
    .string()
    .min(MIN_TITLE_LENGTH, `Mínimo ${MIN_TITLE_LENGTH} caracteres`)
    .max(MAX_TITLE_LENGTH, `Máximo ${MAX_TITLE_LENGTH} caracteres`)
    .trim(),

  slug: slugSchema,

  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Máximo ${MAX_DESCRIPTION_LENGTH} caracteres`)
    .nullable()
    .optional(),

  shortDescription: z
    .string()
    .max(
      MAX_SHORT_DESCRIPTION_LENGTH,
      `Máximo ${MAX_SHORT_DESCRIPTION_LENGTH} caracteres`
    )
    .nullable()
    .optional(),

  eventType: z.enum(EVENT_TYPES, EVENT_TYPES_MESSAGE),

  durationMinutes: z
    .number()
    .int("Duración en minutos")
    .positive("Duración debe ser mayor a 0")
    .max(480, "Máximo 8 horas (480 min)")
    .nullable()
    .optional(),

  ageRating: z
    .string()
    .max(10, "Máximo 10 caracteres")
    .regex(/^(ATP|\+\d+|G|PG|PG-13|R|NC-17)$/, "Formato inválido (ej: +16, ATP)")
    .nullable()
    .optional(),

  posterUrl: z.string().url("URL inválida").nullable().optional(),
  backdropUrl: z.string().url("URL inválida").nullable().optional(),
  trailerUrl: z.string().url("URL inválida").nullable().optional(),
});

export type EventBaseInput = z.infer<typeof eventBaseSchema>;

// ============================================================================
// Schema: Sesión (Función/Horario)
// ============================================================================

export const eventSessionSchema = z
  .object({
    displayName: z
      .string()
      .max(
        MAX_SESSION_LABEL_LENGTH,
        `Máximo ${MAX_SESSION_LABEL_LENGTH} caracteres`
      )
      .nullable()
      .optional(),

    startsAt: timestampSchema,

    endsAt: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "Fecha/hora de fin inválida"
      )
      .nullable()
      .optional(),

    accessStartsAt: z
      .string()
      .refine(
        (val) => !isNaN(Date.parse(val)),
        "Fecha/hora de acceso inválida"
      )
      .nullable()
      .optional(),

    saleStartsAt: timestampSchema,

    saleEndsAt: z
      .string()
      .refine(
        (val) => val === null || !isNaN(Date.parse(val)),
        "Fecha/hora de fin de venta inválida"
      )
      .nullable()
      .optional(),

    totalCapacity: positiveIntSchema,

    roomId: z.string().uuid("ID de sala inválido").nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.endsAt) return true;
      return new Date(data.endsAt) > new Date(data.startsAt);
    },
    {
      message: "La fecha de fin debe ser posterior a la de inicio",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => {
      if (!data.saleEndsAt) return true;
      return new Date(data.saleEndsAt) > new Date(data.saleStartsAt);
    },
    {
      message: "El fin de venta debe ser posterior al inicio",
      path: ["saleEndsAt"],
    }
  )
  .refine(
    (data) => {
      if (!data.accessStartsAt) return true;
      return (
        new Date(data.accessStartsAt) >= new Date(data.startsAt) ||
        new Date(data.accessStartsAt) < new Date(data.startsAt)
      );
    },
    {
      message: "Fecha de acceso inválida",
      path: ["accessStartsAt"],
    }
  );

export type EventSessionInput = z.infer<typeof eventSessionSchema>;

// ============================================================================
// Schema: Sector
// ============================================================================

export const eventSectorSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(MAX_SECTOR_NAME_LENGTH, `Máximo ${MAX_SECTOR_NAME_LENGTH} caracteres`)
    .trim(),

  code: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .regex(/^[A-Z0-9_]+$/, "Solo mayúsculas, números y guiones bajos")
    .nullable()
    .optional(),

  sectorType: z.enum(SECTOR_TYPES, SECTOR_TYPE_MESSAGE),

  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .nullable()
    .optional(),

  seatCount: quantitySchema,

  displayOrder: z.number().int().min(0).default(0),

  colorCode: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Código HEX inválido (ej: #FF5733)")
    .nullable()
    .optional(),

  isNumbered: z.boolean().default(true),
});

export type EventSectorInput = z.infer<typeof eventSectorSchema>;

// ============================================================================
// Schema: Tipo de Ticket
// ============================================================================

export const ticketTypeSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(
        MAX_TICKET_TYPE_NAME_LENGTH,
        `Máximo ${MAX_TICKET_TYPE_NAME_LENGTH} caracteres`
      )
      .trim(),

    description: z
      .string()
      .max(500, "Máximo 500 caracteres")
      .nullable()
      .optional(),

    basePrice: priceSchema,

    totalQuantity: positiveIntSchema,

    minPurchase: z
      .number()
      .int()
      .min(1, "Mínimo 1 entrada")
      .default(1),

    maxPurchase: z
      .number()
      .int()
      .min(1, "Mínimo 1 entrada")
      .max(MAX_PURCHASE_PER_ORDER, `Máximo ${MAX_PURCHASE_PER_ORDER} por orden`)
      .default(6),

    displayOrder: z.number().int().min(0).default(0),

    isVisible: z.boolean().default(true),
  })
  .refine(
    (data) => data.minPurchase <= data.maxPurchase,
    {
      message: "El mínimo no puede ser mayor al máximo",
      path: ["minPurchase"],
    }
  )
  .refine(
    (data) => data.maxPurchase <= MAX_PURCHASE_PER_ORDER,
    {
      message: `Máximo ${MAX_PURCHASE_PER_ORDER} entradas por orden`,
      path: ["maxPurchase"],
    }
  );

export type TicketTypeInput = z.infer<typeof ticketTypeSchema>;

// ============================================================================
// Schema: Etapa de Venta (Preventa/Sale Stage)
// ============================================================================

export const saleStageSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es obligatorio")
      .max(100, "Máximo 100 caracteres")
      .trim(),

    stageOrder: z.number().int().min(1).default(1),

    startsAt: timestampSchema,

    endsAt: z.string().refine(
      (val) => !isNaN(Date.parse(val)),
      "Fecha/hora de fin inválida"
    ),

    salePrice: priceSchema,

    originalPrice: priceSchema.nullable().optional(),

    maxTickets: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional(),
  })
  .refine(
    (data) => new Date(data.endsAt) > new Date(data.startsAt),
    {
      message: "El fin debe ser posterior al inicio",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => {
      if (!data.originalPrice) return true;
      return data.salePrice <= data.originalPrice;
    },
    {
      message: "El precio de venta no puede ser mayor al original",
      path: ["salePrice"],
    }
  );

export type SaleStageInput = z.infer<typeof saleStageSchema>;

// ============================================================================
// Schema: Servicio Adicional
// ============================================================================

export const additionalServiceSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(MAX_SERVICE_NAME_LENGTH, `Máximo ${MAX_SERVICE_NAME_LENGTH} caracteres`)
    .trim(),

  description: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .nullable()
    .optional(),

  price: priceSchema,

  isLimited: z.boolean().default(false),

  totalQuantity: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  availableQuantity: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional(),

  isOptional: z.boolean().default(true),

  maxPerTicket: z.number().int().min(1).default(1),
})
  .refine(
    (data) => {
      if (!data.isLimited) return true;
      return data.totalQuantity !== null && data.totalQuantity !== undefined && data.totalQuantity > 0;
    },
    {
      message: "Si es limitado, debe tener cantidad total definida",
      path: ["totalQuantity"],
    }
  )
  .refine(
    (data) => {
      if (!data.isLimited || !data.availableQuantity) return true;
      return data.availableQuantity <= (data.totalQuantity ?? 0);
    },
    {
      message: "Disponible no puede ser mayor al total",
      path: ["availableQuantity"],
    }
  );

export type AdditionalServiceInput = z.infer<typeof additionalServiceSchema>;

// ============================================================================
// Schema: Código Promocional
// ============================================================================

export const promoCodeSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .max(MAX_PROMO_CODE_LENGTH, `Máximo ${MAX_PROMO_CODE_LENGTH} caracteres`)
      .regex(
        /^[A-Z0-9_-]+$/i,
        "Solo letras, números, guiones y guiones bajos"
      )
      .transform((val) => val.toUpperCase()),

    description: z
      .string()
      .max(200, "Máximo 200 caracteres")
      .nullable()
      .optional(),

    discountType: z.enum(DISCOUNT_TYPES, DISCOUNT_TYPE_MESSAGE),

    discountValue: z.number().positive("El descuento debe ser positivo"),

    maxUses: z
      .number()
      .int()
      .positive()
      .nullable()
      .optional(),

    maxUsesPerUser: z.number().int().min(1).default(1),

    startsAt: timestampSchema,

    endsAt: z
      .string()
      .refine(
        (val) => val === null || !isNaN(Date.parse(val)),
        "Fecha/hora de fin inválida"
      )
      .nullable()
      .optional(),

    applicableTicketTypes: z
      .array(z.string().uuid())
      .nullable()
      .optional(),

    minPurchaseAmount: priceSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.endsAt) return true;
      return new Date(data.endsAt) > new Date(data.startsAt);
    },
    {
      message: "El fin debe ser posterior al inicio",
      path: ["endsAt"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType !== "percentage") return true;
      return data.discountValue <= 100;
    },
    {
      message: "Porcentaje no puede ser mayor a 100",
      path: ["discountValue"],
    }
  );

export type PromoCodeInput = z.infer<typeof promoCodeSchema>;

// ============================================================================
// Schema: Creación Completa de Evento
// ============================================================================

export const createEventSchema = z.object({
  event: eventBaseSchema,

  sessions: z
    .array(eventSessionSchema)
    .min(1, "Debe tener al menos una sesión"),

  sectors: z
    .array(eventSectorSchema)
    .min(1, "Debe tener al menos un sector"),

  ticketTypes: z
    .array(ticketTypeSchema)
    .min(1, "Debe tener al menos un tipo de ticket"),

  saleStages: z.array(saleStageSchema).optional(),

  additionalServices: z.array(additionalServiceSchema).optional(),

  promoCodes: z.array(promoCodeSchema).optional(),
});

export type CreateEventFormInput = z.infer<typeof createEventSchema>;

// ============================================================================
// Schema: Validación de Coherencia de Sesiones
// ============================================================================

export const coherentSessionsSchema = z
  .array(eventSessionSchema)
  .refine(
    (sessions) => {
      // Verificar que no haya sesiones solapadas (mismo horario exacto)
      const startTimes = sessions.map((s) => new Date(s.startsAt).toISOString());
      const uniqueStarts = new Set(startTimes);
      return uniqueStarts.size === startTimes.length;
    },
    {
      message: "No puede haber dos sesiones con el mismo horario de inicio",
    }
  );

export type CoherentSessionsInput = z.infer<typeof coherentSessionsSchema>;

// ============================================================================
// Exports
// ============================================================================

export {
  MAX_PURCHASE_PER_ORDER,
  EVENT_TYPES,
  EVENT_STATUS,
  SESSION_STATUS,
  SECTOR_TYPES,
  DISCOUNT_TYPES,
};
