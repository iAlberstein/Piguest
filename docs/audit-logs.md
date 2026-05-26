# Sistema de Auditoría (Audit Logs)

## Descripción

Sistema de registro de eventos de autenticación y cambios críticos de perfil.

**Principios de seguridad:**
- ✅ Payloads mínimos y seguros
- ✅ NUNCA almacenar: contraseñas, tokens, secrets
- ✅ Solo append (no modificación ni eliminación)
- ✅ Acceso de lectura solo para admins

## Eventos registrados

| Evento | Descripción | Payload incluye |
|--------|-------------|-----------------|
| `auth.login` | Inicio de sesión exitoso | método (password/oauth) |
| `auth.logout` | Cierre de sesión | - |
| `auth.register` | Nuevo registro | email, full_name, source |
| `auth.password_reset` | Solicitud/confirmación de reset | email, action (request/confirm) |
| `auth.password_change` | Cambio de contraseña | - |
| `profile.update` | Actualización de perfil | campos modificados (before/after) |
| `profile.critical_change` | Cambio crítico | email, role, is_blocked, dni |
| `admin.action` | Acción administrativa | target_user, action, details |

## Estructura de la tabla

```sql
audit_logs
├── id (UUID PK)
├── event_type (enum)
├── event_description (text)
├── actor_id (UUID) - quien hizo la acción
├── actor_email (snapshot)
├── actor_role (snapshot)
├── target_id (UUID) - sobre quién (puede ser diferente)
├── target_type (user, profile, etc.)
├── payload (JSONB) - datos seguros
├── ip_address (INET)
├── user_agent (text)
├── request_path (text)
└── created_at (TIMESTAMPTZ)
```

## Uso

### Log de login

```tsx
import { logLogin } from "@/modules/auth/helpers/audit.helper";

// En la server action de login
await logLogin(
  user.id,
  user.email,
  user.role,
  "password", // o "oauth_google", "oauth_apple"
  provider // opcional para oauth
);
```

### Log de registro

```tsx
import { logRegister } from "@/modules/auth/helpers/audit.helper";

await logRegister(
  newUser.id,
  newUser.email,
  newUser.fullName,
  "ROLE_CUSTOMER",
  "email" // o "google", "apple"
);
```

### Log de cambio de perfil

```tsx
import { logProfileUpdate } from "@/modules/auth/helpers/audit.helper";

await logProfileUpdate(
  userId,
  email,
  role,
  ["full_name", "phone"], // campos cambiados
  { full_name: "Viejo", phone: "123" }, // before
  { full_name: "Nuevo", phone: "456" }  // after
);
```

### Log de cambio crítico

```tsx
import { logProfileCriticalChange } from "@/modules/auth/helpers/audit.helper";

// Cuando un admin cambia el rol de un usuario
await logProfileCriticalChange(
  targetUserId,
  targetUserEmail,
  newRole,
  "role",
  oldRole,
  newRole,
  "admin_action",
  adminId // quien hizo el cambio
);
```

## Payloads seguros

### ✅ Seguro incluir

- IDs (user_id, profile_id)
- Emails (para identificación)
- Timestamps
- Nombres de campos modificados
- Valores de campos no sensibles (full_name, province)
- Roles (después de cambios)

### ❌ NUNCA incluir

- Contraseñas (aunque hasheadas)
- Tokens (access, refresh, magic link)
- Secrets o API keys
- DNI completos (solo máscara: "XX***XX")
- Datos de tarjetas de crédito
- Contenido de mensajes privados

## Ejemplos de payloads

### Login

```json
{
  "method": "oauth_google",
  "provider": "google"
}
```

### Profile update

```json
{
  "changed_fields": ["full_name", "phone"],
  "before": {
    "full_name": "Juan Pérez",
    "phone": "+54 11 1234-5678"
  },
  "after": {
    "full_name": "Juan Pérez González",
    "phone": "+54 11 8765-4321"
  }
}
```

### Critical change (role)

```json
{
  "changed_field": "role",
  "before": "ROLE_CUSTOMER",
  "after": "ROLE_PRODUCER",
  "reason": "admin_action"
}
```

## Consultar logs (admin)

```sql
-- Logs de un usuario específico
SELECT * FROM audit_logs
WHERE actor_id = 'user-uuid'
ORDER BY created_at DESC;

-- Logins del último mes
SELECT * FROM audit_logs
WHERE event_type = 'auth.login'
  AND created_at > NOW() - INTERVAL '30 days';

-- Cambios críticos hechos por un admin
SELECT * FROM audit_logs
WHERE event_type = 'profile.critical_change'
  AND actor_id = 'admin-uuid';
```

## Retención de datos

Por defecto, los logs se mantienen indefinidamente. Considerar:
- Archivar logs antiguos (>2 años) a storage frío
- Implementar política de retención según requerimientos legales

## Troubleshooting

### "Error logging audit event"

- Verificar que el service client tiene permisos
- Revisar que los payloads no excedan tamaño de JSONB
- Verificar que event_type es válido

### Logs no aparecen

- Confirmar que RLS permite inserts (service client bypass)
- Verificar que la tabla existe: `SELECT * FROM audit_logs LIMIT 1`
