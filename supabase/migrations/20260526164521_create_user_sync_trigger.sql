-- ============================================================================
-- MIGRACIÓN: Sincronización automática auth.users → profiles
-- ============================================================================
--
-- Descripción:
--   Crea trigger que automáticamente crea un perfil en la tabla profiles
--   cada vez que se crea un nuevo usuario en auth.users.
--
-- Esto asegura:
--   - Consistencia entre auth.users y profiles
--   - Creación automática de perfil sin código manual
--   - Atomicidad (todo en la misma transacción)
-- ============================================================================

-- Crear función que maneja la inserción automática
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar perfil solo si no existe (evita duplicados)
  INSERT INTO public.profiles (
    auth_user_id,
    email,
    full_name,
    dni,
    role,
    phone,
    province,
    locality,
    birth_date,
    gender,
    is_blocked,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NULL,
    'ROLE_CUSTOMER',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    FALSE,
    NOW(),
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
