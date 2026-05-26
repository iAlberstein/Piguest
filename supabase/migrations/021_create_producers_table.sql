-- ============================================================================
-- MIGRACIÓN: Crear tabla producers y aplicar RLS
-- ============================================================================
--
-- Políticas de seguridad:
--   1. Productor administra su propio producer profile
--   2. Admin tiene acceso completo
--   3. Lectura pública limitada (cualquiera puede leer)
--   4. NO escritura pública
--
-- ============================================================================

-- Crear tabla producers si no existe
CREATE TABLE IF NOT EXISTS public.producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  legal_name VARCHAR(255),
  tax_id VARCHAR(50),
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_profile_id UNIQUE (profile_id),
  CONSTRAINT unique_auth_user_id_producer UNIQUE (auth_user_id)
);

-- Index para búsquedas
CREATE INDEX IF NOT EXISTS idx_producers_profile_id ON public.producers(profile_id);
CREATE INDEX IF NOT EXISTS idx_producers_auth_user_id ON public.producers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_producers_business_name ON public.producers(business_name);

-- Habilitar RLS
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- 1. SELECT pública - cualquiera puede leer productores activos
CREATE POLICY "Lectura pública de productores activos"
ON public.producers
FOR SELECT
TO public
USING (is_active = TRUE);

-- 2. SELECT autenticados - pueden ver todos los productores
CREATE POLICY "Usuarios autenticados pueden ver productores"
ON public.producers
FOR SELECT
TO authenticated
USING (TRUE);

-- 3. INSERT - solo admins o el propio usuario creando su perfil
CREATE POLICY "Usuarios pueden crear su propio producer"
ON public.producers
FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- 4. UPDATE - productor actualiza su propio perfil
CREATE POLICY "Productores pueden actualizar su propio perfil"
ON public.producers
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- 5. DELETE - solo admins o el propio productor
CREATE POLICY "Productores pueden eliminar su propio perfil"
ON public.producers
FOR DELETE
TO authenticated
USING (auth_user_id = auth.uid());

-- 6. Admin acceso completo - usando la función is_admin() ya creada
CREATE POLICY "Admins acceso completo producers"
ON public.producers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Comentarios
COMMENT ON TABLE public.producers IS 
  'Perfiles de productores/empresas organizadoras de eventos';

COMMENT ON COLUMN public.producers.auth_user_id IS 
  'Referencia al usuario propietario del perfil de productor';
