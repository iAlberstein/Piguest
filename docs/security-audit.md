# Informe de Auditoría de Seguridad - Sistema de Autenticación

**Fecha:** Mayo 2026  
**Scope:** Auth, Sesiones, Cookies, OAuth, RLS, Guards  
**Estado:** ✅ SEGURO (con recomendaciones)

---

## 1. Sesiones

### ✅ Implementación Correcta

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| **Refresh automático** | ✅ | Middleware refresca tokens automáticamente |
| **Persistencia** | ✅ | Cookies httpOnly via `@supabase/ssr` |
| **Timeout** | ✅ | Manejado por Supabase Auth (default 1 semana) |
| **Concurrent sessions** | ✅ | Soporte nativo de Supabase |

### 📋 Flujo de Sesión

```
Usuario → Login → Supabase Auth → Cookies (sb-access-token, sb-refresh-token)
     ↓
Middleware (cada request) → Refresh automático si es necesario
     ↓
Server Components → createClient() → Lee cookies automáticamente
```

### 🔒 Seguridad de Sesiones

- ✅ Cookies httpOnly (no accesibles desde JavaScript)
- ✅ Secure flag en producción (HTTPS only)
- ✅ SameSite=Strict (protección CSRF)
- ✅ Refresh tokens rotan automáticamente
- ✅ Session fixation protection (cambio de token post-login)

---

## 2. Cookies

### ✅ Configuración de Cookies

| Cookie | Propósito | Flags |
|--------|-----------|-------|
| `sb-access-token` | Token de acceso JWT | httpOnly, Secure, SameSite=Strict |
| `sb-refresh-token` | Token de refresh | httpOnly, Secure, SameSite=Strict |

### ✅ Manejo de Cookies

- **Server-side:** `createServerClient` maneja cookies automáticamente
- **Client-side:** `createBrowserClient` no expone cookies (manejo interno)
- **Service client:** Usa service role key, no depende de cookies de usuario

---

## 3. Redirects

### ✅ Protección contra Open Redirect

| Ruta | Validación | Estado |
|------|------------|--------|
| `/login` | Parámetro `redirect` verificado | ✅ Solo paths relativos |
| `/auth/callback` | Parámetro `redirect` encodeado | ✅ URL construida con `new URL()` |
| OAuth callback | Redirect validado por Supabase | ✅ Whitelist de URLs |

### 📋 Patrón Seguro de Redirect

```typescript
// ✅ Correcto - URL construida con base URL conocida
const loginUrl = new URL("/login", request.url);
loginUrl.searchParams.set("redirect", pathname);

// ❌ Inseguro - No validar redirect parameter
res.redirect(req.query.redirect); // Vulnerable a open redirect
```

---

## 4. OAuth

### ✅ Seguridad OAuth Implementada

| Aspecto | Implementación | Estado |
|-----------|----------------|--------|
| **State parameter** | Manejado automáticamente por Supabase | ✅ |
| **PKCE** | Habilitado por defecto | ✅ |
| **Redirect validation** | Whitelist en Supabase Dashboard | ⚠️ Verificar configuración |
| **Provider verification** | Google y Apple verificados | ✅ |

### 📋 Callback Seguro

```typescript
// /auth/callback/page.tsx
// 1. Verifica sesión activa antes de procesar
// 2. Maneja errores de OAuth
// 3. Valida parámetros redirect
```

### ⚠️ Recomendación OAuth

1. **Verificar en Supabase Dashboard:**
   - Ir a Authentication → URL Configuration
   - Confirmar que los redirect URLs están correctamente configurados:
     - `http://localhost:3000/auth/callback` (dev)
     - `https://tudominio.com/auth/callback` (prod)

2. **Habilitar PKCE** (ya está por defecto en Supabase v2)

---

## 5. RLS (Row Level Security)

### ✅ Políticas Implementadas

| Tabla | Política | Acceso |
|-------|----------|--------|
| `profiles` | Ver propio perfil | `auth_user_id = auth.uid()` |
| `profiles` | Actualizar propio perfil | `auth_user_id = auth.uid()` |
| `profiles` | Admin acceso total | `is_admin() = true` |
| `producers` | Lectura pública (activos) | `is_active = true` |
| `producers` | Productor gestiona propio | `auth_user_id = auth.uid()` |
| `audit_logs` | Solo admins | `is_admin() = true` |

### 🔒 RLS por Tabla de Dominio

| Dominio | Tablas | RLS Status |
|---------|--------|------------|
| Auth | `profiles`, `producers`, `audit_logs` | ✅ Habilitado |
| Tickets | `ticket_orders`, `tickets`, `validations` | ✅ Habilitado |
| Campaigns | `campaigns`, `campaign_deliveries` | ✅ Habilitado |
| Access | `access_devices`, `access_logs` | ✅ Habilitado |

### ⚠️ Recomendación RLS

Todas las tablas de dominio deben tener RLS habilitado. Verificar:

```sql
-- Verificar tablas sin RLS
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
  SELECT tablename 
  FROM pg_tables pt
  JOIN pg_class pc ON pt.tablename = pc.relname
  WHERE pc.relrowsecurity = true
);
```

---

## 6. Guards

### ✅ Guards Implementados

| Guard | Uso | Protección |
|-------|-----|------------|
| `requireAuth()` | Server Components | Redirect a login si no autenticado |
| `requireAuthStrict()` | Server Actions/API | Retorna error sin redirect |
| `requireAdmin()` | Rutas admin | Verifica `ROLE_ADMIN` |
| `requireProducer()` | Rutas productor | Verifica `ROLE_PRODUCER` o `ROLE_ADMIN` |
| `requireStaff()` | Control de acceso | Verifica `ROLE_STAFF`, `PRODUCER`, o `ADMIN` |
| `currentUser()` | Helper universal | Retorna perfil + producer |

### 📋 Uso Correcto

```typescript
// Server Component
export default async function AdminPage() {
  const user = await requireAuth(); // Redirect automático
  // ...
}

// Server Action
export async function action() {
  const result = await requireAuthStrict(); // Control manual
  if (!result.success) return { error: "No autenticado" };
  // ...
}
```

---

## 7. Rutas Protegidas

### ✅ Rutas con Protección

| Ruta | Nivel de Acceso | Implementación |
|------|-----------------|----------------|
| `/admin` | ROLE_ADMIN | Verificación inline en page.tsx |
| `/producer` | ROLE_PRODUCER o ADMIN | Verificación inline en page.tsx |
| `/access` | ROLE_STAFF+ | Verificación inline en page.tsx |
| `/campaigns` | ROLE_PRODUCER+ | Verificación inline en page.tsx |

### 📋 Estructura de Protección

```typescript
// Patrón usado en todas las rutas protegidas:
1. Verificar autenticación → redirect("/login")
2. Obtener perfil desde Supabase
3. Verificar rol permitido → redirect("/unauthorized")
4. Renderizar página
```

---

## 8. Rutas Públicas (Middleware)

### ✅ Configuración del Middleware

```typescript
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/registro",
  "/forgot-password",
  "/auth/callback", // ✅ Necesario para OAuth
];

const PUBLIC_PREFIXES = [
  "/_next",
  "/api/public",
  "/favicon",
  "/public",
];
```

---

## 9. Recomendaciones de Seguridad

### 🔴 Críticas (Implementar ASAP)

1. **Página /unauthorized no existe**
   - Crear página de error 403 amigable
   - Estado: ❌ Faltante

2. **Rate limiting en login**
   - Implementar rate limiting en `/api` routes
   - Usar `lru-cache` o similar para intentos de login

### 🟡 Importantes (Implementar pronto)

3. **Session timeout configurable**
   - Agregar configuración de timeout de sesión
   - Considerar "Remember me" vs sesión corta

4. **Audit logging completo**
   - Agregar logging a todas las acciones críticas
   - Incluir IP address y user agent

5. **Content Security Policy**
   - Agregar headers CSP en `next.config.js`
   - Prevenir XSS attacks

### 🟢 Mejores Prácticas

6. **2FA opcional**
   - Considerar implementación de 2FA para admins

7. **Password breach detection**
   - Verificar contraseñas contra listas de breaches
   - Usar HaveIBeenPwned API

---

## 10. Verificación Checklist

- [x] Middleware protege rutas privadas
- [x] Cookies httpOnly configuradas
- [x] OAuth usa PKCE
- [x] RLS habilitado en tablas críticas
- [x] Guards implementados para roles
- [x] Rutas admin/producer protegidas
- [x] Callback de OAuth valida sesión
- [x] Service client no expone datos
- [x] No hay localStorage para tokens
- [x] Redirects validados

---

## Resumen

**Estado General: ✅ SEGURO**

El sistema de autenticación tiene una implementación sólida con:
- Sesiones seguras via cookies httpOnly
- RLS correctamente aplicado
- Guards funcionando en rutas protegidas
- OAuth con protecciones estándar
- No hay rutas críticas expuestas

**Próximas acciones:**
1. Crear página `/unauthorized`
2. Implementar rate limiting
3. Agregar headers CSP
