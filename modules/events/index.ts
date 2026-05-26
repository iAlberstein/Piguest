/**
 * Módulo de Eventos - Piguest
 *
 * Exportaciones principales del módulo.
 *
 * @example
 * ```ts
 * import { CreateEventForm, useEventSessions } from "@/modules/events";
 * ```
 */

// Tipos
export * from "./types/event.types";

// Schemas (validación Zod)
export * from "./forms/event.schemas";

// Components (serán exportados cuando se creen)
// export { CreateEventForm } from "./components/CreateEventForm";
// export { EventCard } from "./components/EventCard";
// export { SessionSelector } from "./components/SessionSelector";

// Hooks (serán exportados cuando se creen)
// export { useEvents } from "./hooks/useEvents";
// export { useEventSessions } from "./hooks/useEventSessions";

// Server Actions
export { createEvent } from "./actions/create-event.action";
export { updateEvent } from "./actions/update-event.action";
export { publishEvent } from "./actions/publish-event.action";
export { hideEvent } from "./actions/hide-event.action";
export { unhideEvent } from "./actions/unhide-event.action";
export { cancelEvent } from "./actions/cancel-event.action";
export {
  addEventSession,
  updateEventSession,
  removeEventSession,
} from "./actions/event-session.actions";
export {
  getEventBySlug,
  getProducerEvents,
  getPublicEvents,
} from "./actions/get-events.action";
