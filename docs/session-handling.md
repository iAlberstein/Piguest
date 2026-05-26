# Manejo de Sesiones en App Router

## Arquitectura

Las sesiones se manejan **exclusivamente mediante cookies httpOnly**, sin localStorage:

```
┌─────────────────────────────────────────────────────────────────┐
│                     SESSION FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN (Server Action)                                       │
│     └─→ supabase.auth.signInWithPassword()                     │
│         └─→ @supabase/ssr setea cookies automáticamente         │
│                                                                  │
│  2. MIDDLEWARE (cada request)                                     │
│     └─→ createServerClient() refresca token si es necesario     │
│         └─→ Cookies actualizadas en response                     │
│                                                                  │
│  3. SERVER COMPONENTS                                           │
│     └─→ createClient() lee cookies de headers                  │
│         └─→ getSession() obtiene sesión válida                 │
│                                                                  │
│  4. CLIENT COMPONENTS                                            │
│     └─→ getSupabaseClient() singleton browser client           │
│         └─→ onAuthStateChange() escucha cambios                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Cookies

| Cookie | Propósito | httpOnly | Segura |
|--------|-----------|----------|--------|
| `sb-access-token` | Access token JWT | ✅ | ✅ (prod) |
| `sb-refresh-token` | Refresh token | ✅ | ✅ (prod) |

⚠️ **NUNCA almacenar tokens en localStorage** - Las cookies httpOnly previenen XSS.

## Uso por contexto

### Server Components

```tsx
// app/dashboard/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return <div>Bienvenido {session.user.email}</div>;
}
```

### Server Actions

```tsx
// actions/create-order.action.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function createOrderAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autenticado" };
  }

  // Crear orden...
}
```

### Client Components

```tsx
// components/UserMenu.tsx (Client Component)
"use client";

import { useSession } from "@/modules/auth/hooks/useSession";

export function UserMenu() {
  const { user, isLoading } = useSession();

  if (isLoading) return <div>Cargando...</div>;
  if (!user) return <a href="/login">Login</a>;

  return <div>Hola {user.fullName}</div>;
}
```

### Route Handlers (API)

```tsx
// app/api/orders/route.ts
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Fetch orders...
}
```

## Refresh Automático

El middleware (`middleware.ts`) maneja el refresh automáticamente:

```typescript
// En cada request:
const { data: { session } } = await supabase.auth.getSession();
// ↑ Si el token expiró, Supabase SSR refresca automáticamente
//   usando el refresh token y actualiza las cookies
```

## Protección de Rutas

El middleware protege rutas privadas:

```typescript
// middleware.ts
const PUBLIC_ROUTES = ["/", "/login", "/registro", "/forgot-password"];

if (!isPublicRoute(pathname) && !session) {
  return NextResponse.redirect(new URL("/login", request.url));
}
```

## Flujo de Logout

```typescript
// Server Action o Client Component
import { createClient } from "@/lib/supabase/server"; // o /client

async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Las cookies se limpian automáticamente
}
```

## Seguridad

| Amenaza | Mitigación |
|---------|------------|
| XSS | Cookies httpOnly - JS no puede leer tokens |
| CSRF | SameSite cookie policy (lax por defecto) |
| Token theft | Short-lived access tokens (1 hora) |
| Session hijacking | Refresh token rotation en cada uso |

## Troubleshooting

### "No session found" en Server Component

Verificar que el middleware esté funcionando:
```bash
# Debe existir middleware.ts en la raíz
ls middleware.ts
```

### "Auth session missing" en Client Component

El usuario no está autenticado o las cookies expiraron.

### Loop de redirects

Verificar que `/login` esté en `PUBLIC_ROUTES` del middleware.

## Referencias

- [@supabase/ssr](https://github.com/supabase/ssr)
- [Next.js App Router Auth](https://supabase.com/docs/guides/auth/server-side/nextjs)
