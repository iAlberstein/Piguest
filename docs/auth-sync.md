# Sincronización Automática: auth.users → profiles

## Arquitectura

La sincronización se implementa mediante **PostgreSQL Triggers**:

```
auth.users (Supabase Auth)
    ↓ INSERT
    ↓ Trigger: on_auth_user_created
    ↓ Function: handle_new_user()
profiles (Tabla pública)
```

## Ventajas de esta aproximación

| Aspecto | Trigger PostgreSQL | Código manual |
|---------|-------------------|---------------|
| **Atomicidad** | ✅ Transaccional | ❌ Race conditions posibles |
| **Consistencia** | ✅ Siempre se ejecuta | ❌ Puede olvidarse |
| **Performance** | ✅ Nativo de DB | ❌ HTTP round-trip |
| **Mantenimiento** | ✅ Una sola fuente | ❌ Múltiples lugares |

## Implementación

### Archivo de migración

`supabase/migrations/018_create_user_sync_trigger.sql`

Contiene:
- Función `handle_new_user()` - Lógica de sincronización
- Trigger `on_auth_user_created` - Se ejecuta en INSERT de auth.users

### Lógica del trigger

```sql
AFTER INSERT ON auth.users
  ↓
IF profile no existe:
  INSERT INTO profiles(
    auth_user_id = NEW.id,
    email = NEW.email,
    full_name = NEW.raw_user_meta_data->>'full_name',
    role = 'ROLE_CUSTOMER',
    ... resto de campos NULL
  )
```

## Comportamiento

### Creación de usuario

Cualquier método de creación dispara el trigger:

- ✅ Email/password signup
- ✅ OAuth (Google, Apple)
- ✅ Magic Link
- ✅ Invitations
- ✅ Admin API

### Campos mapeados

| auth.users | profiles |
|------------|----------|
| `id` | `auth_user_id` |
| `email` | `email` |
| `raw_user_meta_data->>'full_name'` | `full_name` |
| - | `role` = `'ROLE_CUSTOMER'` |
| - | Resto = `NULL` |

### Prevención de duplicados

```sql
ON CONFLICT (auth_user_id) DO NOTHING
```

Si el perfil ya existe (ej: creado manualmente), el trigger no falla.

## Aplicar migración

### Local

```bash
supabase db push
```

### Producción

```bash
supabase db push --linked
```

O ejecutar manualmente en SQL Editor:

```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Verificar función
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

## Testing

### Test 1: Nuevo registro

```sql
-- Crear usuario de prueba
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@example.com', 'encrypted', NOW())
RETURNING id;

-- Verificar perfil creado
SELECT * FROM profiles WHERE email = 'test@example.com';
```

### Test 2: OAuth simulation

```sql
-- Simular usuario OAuth
INSERT INTO auth.users (
  email, 
  raw_user_meta_data,
  email_confirmed_at
)
VALUES (
  'oauth@test.com',
  '{"full_name": "Test User"}'::jsonb,
  NOW()
);

-- Verificar
SELECT auth_user_id, email, full_name, role 
FROM profiles 
WHERE email = 'oauth@test.com';
```

## Solución de problemas

### El perfil no se crea

1. Verificar que el trigger existe:
```sql
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;
```

2. Verificar errores recientes:
```sql
SELECT * FROM pg_stat_user_functions 
WHERE funcname = 'handle_new_user';
```

### Duplicados de perfiles

El constraint `UNIQUE(auth_user_id)` previene duplicados.
El trigger usa `ON CONFLICT DO NOTHING`.

### Performance

El trigger es O(1) y corre en la misma transacción, no hay overhead significativo.

## Alternativas consideradas

### Opción A: Webhooks (rejected)
- Requiere endpoint HTTP
- Latencia adicional
- Manejo de fallos complejo

### Opción B: Application code (rejected)
- Race conditions
- Requiere modificar todos los lugares de signup
- No cubre creación vía Admin API

### Opción C: PostgreSQL Trigger (selected) ✅
- Transaccional
- Siempre se ejecuta
- Sin dependencias externas
