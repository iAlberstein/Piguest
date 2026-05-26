/**
 * Tipos de dominio para el módulo de Eventos.
 *
 * Define las interfaces, tipos y enums relacionados con:
 * - Eventos (espectáculos)
 * - Sesiones (fechas/horarios de eventos)
 * - Salas (teatros, venues)
 * - Secciones de butacas (platea, palcos, pullman)
 *
 * @module events/types
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Estado de un evento en el sistema.
 */
export type EventStatus =
  | "draft"           // Borrador - solo visible para productor/admin
  | "published"       // Publicado - visible públicamente
  | "on_sale"         // En venta - tickets disponibles
  | "sold_out"        // Agotado - no hay tickets disponibles
  | "cancelled"       // Cancelado - evento anulado
  | "completed";      // Finalizado - evento ya ocurrió

/**
 * Tipos de eventos soportados.
 */
export type EventType =
  | "theater"         // Teatro
  | "concert"         // Concierto
  | "comedy"          // Stand-up / Comedia
  | "dance"           // Danza / Ballet
  | "opera"           // Ópera
  | "musical"         // Musical
  | "other";          // Otro

/**
 * Estado de una sesión específica.
 */
export type SessionStatus =
  | "scheduled"       // Programada - aún no en venta
  | "on_sale"         // En venta
  | "sold_out"        // Agotada
  | "cancelled"       // Cancelada
  | "completed";      // Finalizada

/**
 * Tipos de secciones en una sala.
 */
export type SectionType =
  | "platea"          // Platea General
  | "palcos_bajos"    // Palcos Bajos (PB)
  | "palcos_altos"    // Palcos Altos (PA)
  | "pullman";        // Pullman

/**
 * Estado de una butaca individual.
 */
export type SeatStatus =
  | "available"       // Disponible
  | "selected"        // Seleccionada (en carrito)
  | "locked"          // Bloqueada (checkout en progreso)
  | "sold";           // Vendida

// ============================================================================
// Evento Principal
// ============================================================================

/**
 * Evento (Espectáculo) - Entidad principal del dominio.
 */
export interface Event {
  id: string;
  producerId: string;
  title: string;
  description: string | null;
  shortDescription: string | null;
  type: EventType;
  status: EventStatus;
  posterUrl: string | null;
  backdropUrl: string | null;
  duration: number | null;        // Duración en minutos
  ageRating: string | null;        // Clasificación por edad (+16, APT, etc.)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Evento con información del productor.
 */
export interface EventWithProducer extends Event {
  producer: {
    id: string;
    businessName: string;
  };
}

// ============================================================================
// Sesiones
// ============================================================================

/**
 * Sesión de un evento (fecha y horario específico).
 */
export interface EventSession {
  id: string;
  eventId: string;
  roomId: string;
  startTime: string;              // ISO 8601
  endTime: string | null;         // ISO 8601 (calculado o manual)
  status: SessionStatus;
  saleStartTime: string | null;   // Cuándo empieza la venta
  saleEndTime: string | null;     // Cuándo termina la venta
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sesión con información completa del evento y sala.
 */
export interface EventSessionFull extends EventSession {
  event: Event;
  room: Room;
}

// ============================================================================
// Salas
// ============================================================================

/**
 * Sala / Teatro / Venue.
 */
export interface Room {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Secciones y Butacas
// ============================================================================

/**
 * Sección de una sala (ej: Platea, Palcos, Pullman).
 */
export interface RoomSection {
  id: string;
  roomId: string;
  name: string;
  type: SectionType;
  capacity: number;
  displayOrder: number;
  isActive: boolean;
}

/**
 * Butaca individual.
 */
export interface Seat {
  id: string;
  sectionId: string;
  row: string | null;              // Ej: "A", "B", "PB1"
  number: string | null;           // Ej: "1", "2", "12"
  coordinateX: number | null;      // Para layout visual
  coordinateY: number | null;      // Para layout visual
  isActive: boolean;
}

/**
 * Butaca con estado dinámico para una sesión.
 */
export interface SeatWithStatus extends Seat {
  status: SeatStatus;
  price: number;
  sessionSeatId: string;
}

// ============================================================================
// Precios
// ============================================================================

/**
 * Precio para una sección en una sesión específica.
 */
export interface SectionPrice {
  id: string;
  sessionId: string;
  sectionId: string;
  basePrice: number;
  discountedPrice: number | null;
  discountLabel: string | null;    // Ej: "30% OFF", "2x1"
  isActive: boolean;
}

// ============================================================================
// Inputs y Formularios
// ============================================================================

/**
 * Datos para crear un evento.
 */
export interface CreateEventInput {
  title: string;
  description?: string;
  shortDescription?: string;
  type: EventType;
  duration?: number;
  ageRating?: string;
}

/**
 * Datos para crear una sesión.
 */
export interface CreateSessionInput {
  eventId: string;
  roomId: string;
  startTime: string;
  saleStartTime?: string;
  saleEndTime?: string;
}

/**
 * Datos para actualizar precios de secciones.
 */
export interface UpdateSectionPricesInput {
  sessionId: string;
  prices: Array<{
    sectionId: string;
    basePrice: number;
    discountedPrice?: number;
    discountLabel?: string;
  }>;
}

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

export interface SessionResult {
  success: boolean;
  session?: EventSession;
  error?: {
    code: string;
    message: string;
  };
}
