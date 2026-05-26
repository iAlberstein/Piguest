--
-- Migration: Eliminar tablas legacy event_dates
--
-- Reemplazo: event_dates → event_sessions
--           ticket_event_dates → ticket_event_sessions
--
-- WARNING: Esto elimina datos existentes de event_dates
--

-- 1. Eliminar foreign keys que referencian a ticket_event_dates
ALTER TABLE IF EXISTS ticket_validations
    DROP CONSTRAINT IF EXISTS ticket_validations_ticket_event_date_id_fkey;

-- 2. Eliminar foreign keys de ticket_event_dates
ALTER TABLE IF EXISTS ticket_event_dates
    DROP CONSTRAINT IF EXISTS ticket_event_dates_ticket_id_fkey,
    DROP CONSTRAINT IF EXISTS ticket_event_dates_event_date_id_fkey;

-- 3. Eliminar tablas legacy
DROP TABLE IF EXISTS ticket_event_dates CASCADE;
DROP TABLE IF EXISTS event_dates CASCADE;

-- 4. Actualizar referencias en otras tablas si existen
-- Nota: ticket_event_dates ya no existe, las referencias se migrarán a ticket_event_sessions

-- 5. Comentario para documentación
COMMENT ON TABLE ticket_validations IS 'Validaciones de tickets - referencia actualizada a ticket_event_sessions';
