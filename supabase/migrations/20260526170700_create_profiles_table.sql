-- ============================================================================
-- MIGRACIÓN: Crear tabla profiles para extensión de usuarios
-- ============================================================================
--
-- Esta tabla extiende auth.users con información adicional del perfil.
-- Se sincroniza automáticamente via trigger en auth.users.
-- ============================================================================

-- Crear enum para roles si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM (
      'ROLE_ADMIN',
      'ROLE_PRODUCER', 
      'ROLE_STAFF',
      'ROLE_CUSTOMER'
    );
  END IF;
END $$;

-- Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  dni VARCHAR(20),
  role user_role NOT NULL DEFAULT 'ROLE_CUSTOMER',
  phone VARCHAR(50),
  province VARCHAR(100),
  locality VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(20),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint único para auth_user_id
  CONSTRAINT unique_auth_user_id UNIQUE (auth_user_id)
);

-- Index para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Index para búsquedas por auth_user_id (ya cubierto por unique constraint, pero explícito)
CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);

-- Index para búsquedas por DNI
CREATE INDEX IF NOT EXISTS idx_profiles_dni ON public.profiles(dni) WHERE dni IS NOT NULL;

-- Comentarios
COMMENT ON TABLE public.profiles IS 
  'Perfiles de usuario extendidos, sincronizados con auth.users';

COMMENT ON COLUMN public.profiles.auth_user_id IS 
  'Referencia al usuario en auth.users';

COMMENT ON COLUMN public.profiles.role IS 
  'Rol del usuario: ROLE_ADMIN, ROLE_PRODUCER, ROLE_STAFF, ROLE_CUSTOMER';
