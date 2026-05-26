-- ============================================================================
-- MIGRACIÓN: Tabla de auditoría para eventos de autenticación y perfil
-- ============================================================================
--
-- Eventos registrados:
--   - auth.login: Inicio de sesión exitoso
--   - auth.logout: Cierre de sesión
--   - auth.register: Registro de nuevo usuario
--   - auth.password_reset: Solicitud de reset de contraseña
--   - auth.password_change: Cambio de contraseña
--   - profile.update: Actualización de perfil
--   - profile.critical_change: Cambio crítico (email, role, is_blocked)
--
-- Principios de seguridad:
--   - NO almacenar contraseñas, tokens, ni datos sensibles
--   - Payloads mínimos con solo campos relevantes
--   - Solo append (no modificación ni eliminación)
--   - RLS para lectura solo por admins
-- ============================================================================

-- Crear tipo enum para eventos de auditoría
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_type') THEN
    CREATE TYPE audit_event_type AS ENUM (
      'auth.login',
      'auth.logout',
      'auth.register',
      'auth.password_reset',
      'auth.password_change',
      'profile.update',
      'profile.critical_change',
      'admin.action'
    );
  END IF;
END $$;

-- Crear tabla audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación del evento
  event_type audit_event_type NOT NULL,
  event_description TEXT,
  
  -- Identificación del actor (quien hizo la acción)
  actor_id UUID, -- auth.users.id (puede ser null si anon)
  actor_email VARCHAR(255), -- snapshot del email
  actor_role VARCHAR(50), -- snapshot del rol
  
  -- Identificación del target (sobre quién se hizo la acción)
  target_id UUID, -- puede ser el mismo actor o diferente (admin actions)
  target_type VARCHAR(50), -- 'user', 'profile', 'producer', etc.
  
  -- Payload seguro y mínimo
  payload JSONB, -- solo campos no sensibles, antes/después para cambios
  
  -- Metadata del request
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas comunes
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Índice compuesto para queries por usuario y tipo de evento
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_event 
ON public.audit_logs(actor_id, event_type, created_at DESC);

-- Habilitar RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Solo admins pueden leer logs (inserts solo via functions/triggers con security definer)
CREATE POLICY "Solo admins pueden leer audit_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_admin());

-- No permitir modificaciones (append-only)
CREATE POLICY "No updates en audit_logs"
ON public.audit_logs
FOR UPDATE
TO authenticated
USING (FALSE);

CREATE POLICY "No deletes en audit_logs"
ON public.audit_logs
FOR DELETE
TO authenticated
USING (FALSE);

-- ============================================================================
-- FUNCIÓN PARA REGISTRAR AUDIT LOGS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_event_type audit_event_type,
  p_actor_id UUID,
  p_actor_email VARCHAR DEFAULT NULL,
  p_actor_role VARCHAR DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_target_type VARCHAR DEFAULT 'user',
  p_payload JSONB DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta como owner, permite insert aun con RLS restrictivo
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    event_type,
    event_description,
    actor_id,
    actor_email,
    actor_role,
    target_id,
    target_type,
    payload
  ) VALUES (
    p_event_type,
    p_description,
    p_actor_id,
    p_actor_email,
    p_actor_role,
    p_target_id,
    p_target_type,
    p_payload
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE public.audit_logs IS 
  'Registro inmutable de eventos de autenticación y cambios de perfil';

COMMENT ON COLUMN public.audit_logs.payload IS 
  'JSONB con datos no sensibles. NUNCA incluir: contraseñas, tokens, secrets. Solo campos identificadores (id, email) y valores cambiados (before/after de campos seguros)';

COMMENT ON FUNCTION public.log_audit_event IS 
  'Registra un evento de auditoría. Usar desde triggers o server actions. Security definer permite insert aunque el usuario no tenga permisos directos.';
