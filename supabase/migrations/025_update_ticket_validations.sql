--
-- Migration: Actualizar ticket_validations para usar ticket_event_sessions
--
-- Reemplaza referencias de ticket_event_dates → ticket_event_sessions
--

-- 1. Eliminar foreign key antigua si existe
ALTER TABLE IF EXISTS ticket_validations
    DROP CONSTRAINT IF EXISTS ticket_validations_ticket_event_date_id_fkey;

-- 2. Renombrar columna
ALTER TABLE ticket_validations
    RENAME COLUMN event_date_id TO ticket_event_session_id;

-- 3. Agregar nueva foreign key (permitir NULL temporalmente para migración de datos)
ALTER TABLE ticket_validations
    ADD CONSTRAINT ticket_validations_ticket_event_session_id_fkey
    FOREIGN KEY (ticket_event_session_id) REFERENCES ticket_event_sessions(id)
    ON DELETE SET NULL;

-- 4. Actualizar comentario
COMMENT ON COLUMN ticket_validations.ticket_event_session_id IS 'Referencia a ticket_event_sessions (reemplaza event_dates)';
