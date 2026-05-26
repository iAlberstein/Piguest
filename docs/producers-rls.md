# Row Level Security (RLS) - Tabla Producers

## Resumen

La tabla `producers` tiene RLS habilitado con las siguientes políticas:

| Política | Operación | Acceso |
|----------|-----------|--------|
| Lectura pública | SELECT | Público (solo activos) |
| Lectura autenticados | SELECT | Cualquier usuario autenticado |
| Crear propio | INSERT | auth_user_id = auth.uid() |
| Actualizar propio | UPDATE | auth_user_id = auth.uid() |
| Eliminar propio | DELETE | auth_user_id = auth.uid() |
| Admin acceso total | ALL | is_admin() = true |

## Reglas implementadas

### 1. Lectura pública limitada

```sql
CREATE POLICY "Lectura pública de productores activos"
ON public.producers
FOR SELECT
TO public
USING (is_active = TRUE);
```

- Cualquiera (incluso sin autenticar) puede ver productores activos
- Los inactivos (`is_active = FALSE`) no son visibles públicamente

### 2. Productor administra su propio perfil

```sql
-- Crear su propio perfil
CREATE POLICY "Usuarios pueden crear su propio producer"
ON public.producers
FOR INSERT
WITH CHECK (auth_user_id = auth.uid());

-- Actualizar
CREATE POLICY "Productores pueden actualizar su propio perfil"
FOR UPDATE
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Eliminar
CREATE POLICY "Productores pueden eliminar su propio perfil"
FOR DELETE
USING (auth_user_id = auth.uid());
```

### 3. Admin acceso completo

```sql
CREATE POLICY "Admins acceso completo producers"
ON public.producers
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
```

- Admins pueden ver/crear/actualizar/eliminar CUALQUIER perfil de productor
- Reutiliza la función `is_admin()` ya creada en profiles

### 4. NO escritura pública

No hay políticas de INSERT/UPDATE/DELETE para `TO public`.
Solo usuarios autenticados pueden modificar datos.

## Verificación

### Test 1: Público puede ver productores activos

```sql
-- Como usuario anónimo
SELECT * FROM producers;
-- Resultado: solo productores con is_active = TRUE
```

### Test 2: Productor ve su propio perfil

```sql
-- Como productor autenticado
SELECT * FROM producers WHERE auth_user_id = auth.uid();
-- Resultado: su propio perfil
```

### Test 3: Productor actualiza su perfil

```sql
UPDATE producers 
SET business_name = 'Nuevo Nombre'
WHERE auth_user_id = auth.uid();
-- Resultado: éxito (solo su propia fila)
```

### Test 4: Productor NO puede actualizar otro

```sql
UPDATE producers 
SET business_name = 'Hack'
WHERE id = 'otro-producer-id';
-- Resultado: 0 filas afectadas (RLS bloquea)
```

### Test 5: Admin acceso total

```sql
-- Como admin
SELECT * FROM producers;
-- Resultado: TODOS los productores (activos e inactivos)

UPDATE producers SET is_active = FALSE WHERE id = 'cualquier-id';
-- Resultado: éxito (admin puede modificar todo)
```

## Estructura de la tabla

| Columna | Tipo | Descripción |
|---------|------|-------------|
| id | UUID | PK autogenerado |
| profile_id | UUID | FK a profiles (único) |
| auth_user_id | UUID | FK a auth.users (único) |
| business_name | VARCHAR(255) | Nombre comercial |
| legal_name | VARCHAR(255) | Razón social |
| tax_id | VARCHAR(50) | CUIT/CUIL |
| address | TEXT | Dirección |
| phone | VARCHAR(50) | Teléfono |
| email | VARCHAR(255) | Email de contacto |
| website | VARCHAR(255) | Sitio web |
| is_active | BOOLEAN | Activo/inactivo |
| created_at | TIMESTAMPTZ | Fecha creación |
| updated_at | TIMESTAMPTZ | Fecha actualización |

## Relaciones

```
auth.users (1) ──── (1) profiles (1) ──── (1) producers
     │                      │                    │
     └─ auth_user_id        └─ profile_id       └─ auth_user_id
```

Un usuario → Un perfil → Un producer profile (opcional)
