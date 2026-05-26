# Helper currentUser()

## Descripción

Helper reutilizable para obtener el usuario actual completo, incluyendo:
- Perfil completo (`profiles`)
- Rol
- Relación con producer (si existe)

**Optimización:** Realiza una sola query con JOIN entre `profiles` y `producers`.

## Uso

### Server Component

```tsx
import { currentUser } from "@/modules/auth/helpers/current-user.helper";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const result = await currentUser();

  if (!result.success) {
    redirect("/login");
  }

  const { profile, producer } = result.user;

  return (
    <div>
      <h1>Hola {profile.fullName}</h1>
      <p>Rol: {profile.role}</p>
      {producer && <p>Empresa: {producer.businessName}</p>}
    </div>
  );
}
```

### Server Action

```tsx
"use server";

import { currentUser } from "@/modules/auth/helpers/current-user.helper";

export async function createEventAction(formData: FormData) {
  const result = await currentUser();

  if (!result.success) {
    return { error: "No autenticado" };
  }

  const { profile, producer } = result.user;

  // Verificar rol
  if (profile.role !== "ROLE_PRODUCER" && profile.role !== "ROLE_ADMIN") {
    return { error: "No autorizado" };
  }

  // Crear evento asociado al producer
  const producerId = producer?.id;
  // ...
}
```

### Route Handler

```tsx
import { currentUser } from "@/modules/auth/helpers/current-user.helper";

export async function GET() {
  const result = await currentUser();

  if (!result.success) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { profile } = result.user;

  return Response.json({ user: profile });
}
```

## API

### `currentUser()`

```typescript
async function currentUser(): Promise<
  | { success: true; user: CurrentUser }
  | { success: false; error: { code: string; message: string } }
>;
```

### Tipos

```typescript
interface CurrentUser {
  sessionUser: SessionUser;          // User básico (id, email, role)
  profile: CurrentUserProfile;         // Perfil completo
  producer: CurrentUserProducer | null; // Producer relacionado (opcional)
}

interface CurrentUserProfile {
  id: string;
  authUserId: string;
  email: string;
  fullName: string | null;
  dni: string | null;
  role: AuthRole;                      // "ROLE_ADMIN" | "ROLE_PRODUCER" | "ROLE_STAFF" | "ROLE_CUSTOMER"
  phone: string | null;
  province: string | null;
  locality: string | null;
  birthDate: string | null;
  gender: string | null;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CurrentUserProducer {
  id: string;
  businessName: string;
  legalName: string | null;
  taxId: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isActive: boolean;
}
```

## Helpers específicos por rol

### `currentAdmin()`

Obtiene usuario solo si es admin:

```tsx
import { currentAdmin } from "@/modules/auth/helpers/current-user.helper";

const result = await currentAdmin();
if (!result.success) {
  // Error: No autenticado o no es admin
  return { error: result.error.message };
}
```

### `currentProducer()`

Obtiene usuario solo si es productor o admin:

```tsx
import { currentProducer } from "@/modules/auth/helpers/current-user.helper";

const result = await currentProducer();
if (!result.success) {
  // Error: No autenticado o no tiene permisos de productor
  return { error: result.error.message };
}
```

### `currentStaff()`

Obtiene usuario solo si es staff, productor o admin:

```tsx
import { currentStaff } from "@/modules/auth/helpers/current-user.helper";

const result = await currentStaff();
if (!result.success) {
  // Error: No autenticado o no es staff
  return { error: result.error.message };
}
```

## Códigos de error

| Código | Descripción |
|--------|-------------|
| `auth/unauthenticated` | No hay sesión activa |
| `profile/not-found` | Perfil no encontrado en la base de datos |
| `auth/forbidden` | Usuario no tiene el rol requerido |
| `auth/unknown-error` | Error inesperado |

## Optimización

El helper realiza **una sola query** con JOIN:

```sql
SELECT profiles.*, producers.*
FROM profiles
LEFT JOIN producers ON profiles.id = producers.profile_id
WHERE profiles.auth_user_id = ?
```

Esto evita:
- Query N+1 para obtener producer
- Múltiples llamadas a la base de datos

## Diferencia con Guards

| | `currentUser()` | `requireAdmin()` (guards) |
|--|----------------|---------------------------|
| **Retorno** | Datos del usuario | Usuario o redirect |
| **Uso** | Obtener datos | Proteger rutas |
| **Error handling** | Retorna objeto error | Hace redirect automático |
| **Flexibilidad** | Mayor (puedes decidir qué hacer) | Menor (siempre redirect) |

Ejemplo de decisión:

```tsx
// Con currentUser() - decides el comportamiento
const result = await currentUser();
if (!result.success) {
  // Puedes: redirect, mostrar error, retornar JSON, etc.
  return <ErrorMessage message={result.error.message} />;
}

// Con requireAdmin() - redirect automático
const user = await requireAdmin(); // Siempre redirect si no es admin
```
