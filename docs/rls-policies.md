# Row Level Security (RLS) - Políticas de Seguridad

## Resumen

La tabla `profiles` tiene RLS habilitado con las siguientes políticas:

| Política | Operación | Acceso |
|----------|-----------|--------|
| Usuarios propio perfil | SELECT | auth_user_id = auth.uid() |
| Usuarios propio perfil | UPDATE | auth_user_id = auth.uid() |
| Admins acceso completo | ALL | is_admin() = true |

## Reglas implementadas

### 1. Usuario ve su propio perfil

```sql
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());
```

- Todo usuario autenticado puede hacer SELECT
- Pero solo ve filas donde `auth_user_id` coincide con su UUID

### 2. Usuario actualiza su propio perfil

```sql
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());
```

- Usuarios pueden hacer UPDATE solo en su propia fila
- `WITH CHECK` asegura que no puedan cambiar el auth_user_id

### 3. Admins acceso completo

```sql
-- Función helper
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE auth_user_id = auth.uid()
    AND role = 'ROLE_ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para cada operación
CREATE POLICY "Admins tienen acceso completo SELECT" ...
CREATE POLICY "Admins tienen acceso completo INSERT" ...
CREATE POLICY "Admins tienen acceso completo UPDATE" ...
CREATE POLICY "Admins tienen acceso completo DELETE" ...
```

- Admins pueden ver/insertar/actualizar/borrar CUALQUIER perfil
- La función `is_admin()` verifica el rol del usuario actual

## Verificación

### Test 1: Usuario normal solo ve su perfil

```sql
-- Como usuario autenticado (no admin)
SELECT * FROM profiles;
-- Resultado: solo 1 fila (la propia)
```

### Test 2: Usuario normal no puede ver otros perfiles

```sql
-- Intentar ver perfil de otro usuario
SELECT * FROM profiles WHERE auth_user_id = 'otro-uuid';
-- Resultado: 0 filas (vacío)
```

### Test 3: Admin ve todos los perfiles

```sql
-- Como admin
SELECT * FROM profiles;
-- Resultado: todas las filas
```

### Test 4: Usuario anónimo no ve nada

```sql
-- Sin autenticación
SELECT * FROM profiles;
-- Resultado: ERROR - RLS policy violation
```

## Troubleshooting

### "new row violates row-level security policy"

El trigger automático está creando perfiles, pero el RLS puede bloquear inserts si el usuario no tiene permisos. El trigger usa `SECURITY DEFINER` que ejecuta como owner, evitando este problema.

### "policy with check expression violated"

El usuario está intentando actualizar un campo que no puede (ej: cambiar auth_user_id).

### Queries desde Dashboard SQL Editor

El SQL Editor corre como `postgres` role (superuser), ignora RLS. Para testear RLS:

```sql
-- Simular usuario específico
SET LOCAL ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';

-- Ahora las queries respetan RLS
SELECT * FROM profiles;
```
