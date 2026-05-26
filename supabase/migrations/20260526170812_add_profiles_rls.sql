-- ============================================================================
-- MIGRACIÓN: Row Level Security (RLS) para tabla profiles
-- ============================================================================
--
-- Políticas de seguridad:
--   1. Usuarios pueden ver su propio perfil
--   2. Usuarios pueden actualizar su propio perfil
--   3. Admins tienen acceso completo (lectura/escritura)
--   4. NO hay acceso público de lectura
--
-- Esto asegura que los datos de perfil estén protegidos a nivel de base de datos
-- ============================================================================

-- Habilitar RLS en la tabla profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar duplicados en re-runs)
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Admins tienen acceso completo" ON public.profiles;

-- ============================================================================
-- Política 1: SELECT - Usuarios ven su propio perfil
-- ============================================================================
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- ============================================================================
-- Política 2: UPDATE - Usuarios actualizan su propio perfil
-- ============================================================================
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- ============================================================================
-- Política 3: ALL - Admins tienen acceso completo
-- ============================================================================
-- Función auxiliar para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid()
    AND role = 'ROLE_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política de admin para SELECT
CREATE POLICY "Admins tienen acceso completo SELECT"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Política de admin para INSERT
CREATE POLICY "Admins tienen acceso completo INSERT"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Política de admin para UPDATE
CREATE POLICY "Admins tienen acceso completo UPDATE"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Política de admin para DELETE
CREATE POLICY "Admins tienen acceso completo DELETE"
ON public.profiles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================================
-- Comentarios de documentación
-- ============================================================================
COMMENT ON POLICY "Usuarios pueden ver su propio perfil" ON public.profiles IS
  'Cada usuario autenticado solo puede ver su propia fila de profiles';

COMMENT ON POLICY "Usuarios pueden actualizar su propio perfil" ON public.profiles IS
  'Cada usuario autenticado solo puede actualizar su propia fila de profiles';

COMMENT ON FUNCTION public.is_admin() IS
  'Verifica si el usuario actual tiene rol ROLE_ADMIN en profiles';
