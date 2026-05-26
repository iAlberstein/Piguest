# Manejo Centralizado de Errores de Autenticación

## Objetivos

- ✅ **Mensajes claros** para el usuario final
- ✅ **Evitar leaks** de información interna
- ✅ **UX consistente** en toda la aplicación
- ✅ **NO mostrar errores crudos** de Supabase

## Principios

1. **Nunca exponer errores internos**: Los errores de Supabase se mapean a mensajes genéricos
2. **Mensajes accionables**: Siempre incluir qué puede hacer el usuario
3. **Logging separado**: Guardar errores técnicos para debug, mostrar mensajes amigables
4. **Consistencia**: Mismo formato de error en toda la app

## Estructura

```
/modules/auth/errors/
└── auth-errors.ts    # Centralización de errores
```

## Tipos de Errores

### Códigos de Error

| Código | Descripción | Mensaje al Usuario |
|--------|-------------|-------------------|
| `validation/error` | Error de validación genérico | "Por favor corrige los campos marcados" |
| `auth/invalid_credentials` | Credenciales incorrectas | "Email o contraseña incorrectos" |
| `auth/user_not_found` | Usuario no existe | "No existe cuenta con este email" |
| `auth/email_exists` | Email duplicado | "Ya existe cuenta con este email" |
| `auth/email_not_confirmed` | Email no verificado | "Revisa tu bandeja de entrada" |
| `auth/weak_password` | Contraseña insegura | "Usa 8+ chars con mayúscula, minúscula, número" |
| `auth/rate_limit` | Demasiados intentos | "Espera unos minutos antes de reintentar" |
| `auth/session_expired` | Sesión expirada | "Inicia sesión nuevamente" |
| `auth/network_error` | Error de red | "Verifica tu conexión e intenta de nuevo" |
| `auth/unknown_error` | Error desconocido | "Ocurrió un error. Intenta nuevamente" |

## Uso

### Server Actions

```typescript
"use server";

import { mapSupabaseError, formatAuthError } from "../errors/auth-errors";
import { loginSchema } from "../forms/login.schema";

export async function loginAction(credentials: unknown) {
  // 1. Validar
  const validation = loginSchema.safeParse(credentials);
  if (!validation.success) {
    return formatValidationErrors(
      validation.error.issues.map(i => ({
        field: i.path.join("."),
        message: i.message
      }))
    );
  }

  // 2. Intentar login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validation.data.email,
    password: validation.data.password,
  });

  // 3. Mapear error de Supabase a error seguro
  if (error) {
    console.error("Login error:", error); // Log técnico
    return formatAuthError(error); // Retorna mensaje seguro
  }

  return { success: true, user: data.user };
}
```

### Client Components

```tsx
"use client";

import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<{
    userMessage: string;
    action?: string;
  } | null>(null);

  async function onSubmit(formData: FormData) {
    const result = await loginAction({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!result.success) {
      // Mostrar mensaje amigable al usuario
      setError({
        userMessage: result.error.userMessage,
        action: result.error.action,
      });
      return;
    }

    // Éxito
    router.push("/dashboard");
  }

  return (
    <form onSubmit={onSubmit}>
      {error && (
        <div className="error-banner">
          <p>{error.userMessage}</p>
          {error.action && (
            <button onClick={handleAction}>{error.action}</button>
          )}
        </div>
      )}
      {/* ... campos del formulario ... */}
    </form>
  );
}
```

## API de Errores

### `mapSupabaseError(error)`

Convierte cualquier error de Supabase en un `AuthError` seguro.

```typescript
import { mapSupabaseError } from "./errors/auth-errors";

try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (err) {
  const authError = mapSupabaseError(err);
  // authError.userMessage: "Email o contraseña incorrectos..."
  // authError.message: "Invalid login credentials" (para logs)
}
```

### `formatAuthError(error)`

Formatea un error para retornar en server actions.

```typescript
const errorResponse = formatAuthError(supabaseError);
// {
//   success: false,
//   error: {
//     code: "auth/invalid_credentials",
//     message: "Email o contraseña incorrectos",
//     userMessage: "Email o contraseña incorrectos...",
//     action: "Verifica tus datos"
//   }
// }
```

### `formatValidationErrors(errors)`

Formatea múltiples errores de Zod.

```typescript
const errors = [
  { field: "email", message: "Formato inválido" },
  { field: "password", message: "Muy corta" }
];

return formatValidationErrors(errors);
```

### Helpers Específicos

```typescript
import {
  unauthenticatedError,
  forbiddenError,
  networkError,
  serverError,
} from "./errors/auth-errors";

// Usuario no autenticado
return unauthenticatedError();

// Sin permisos
return forbiddenError("ROLE_ADMIN");

// Error de red
return networkError();

// Error del servidor
return serverError();
```

## Mapeo de Errores Supabase

| Error Supabase | Nuestro Código | Mensaje Usuario |
|----------------|----------------|-----------------|
| "Invalid login credentials" | `auth/invalid_credentials` | "Email o contraseña incorrectos" |
| "User already registered" | `auth/email_exists` | "Ya existe cuenta con este email" |
| "email_not_confirmed" | `auth/email_not_confirmed` | "Revisa tu bandeja de entrada" |
| "over_email_send_rate_limit" | `auth/rate_limit` | "Demasiados intentos, espera unos minutos" |
| "session_expired" | `auth/session_expired` | "Tu sesión expiró, inicia sesión nuevamente" |
| "Failed to fetch" | `auth/network_error` | "Verifica tu conexión a internet" |

## Seguridad

### ❌ NO HACER

```typescript
// NUNCA mostrar errores crudos de Supabase
return { error: supabaseError.message }; // ❌ Puede leak información

// NUNCA exponer códigos internos
return { error: "PostgreSQL error 23505: unique constraint violation" }; // ❌

// NUNCA dar información sobre existencia de usuarios
if (userNotFound) {
  return { error: "Usuario no existe" }; // ❌ Facilita enumeración
}
```

### ✅ HACER

```typescript
// Mensaje genérico para credenciales
return { error: "Email o contraseña incorrectos" }; // ✅

// Mensaje ambiguo para no revelar existencia
if (emailExists || userNotFound) {
  return { error: "Email o contraseña incorrectos" }; // ✅
}

// Log interno separado
console.error("Auth error:", supabaseError); // ✅ Para debugging
return { error: "Ocurrió un error. Intenta nuevamente." }; // ✅ Para usuario
```

## Extender el Sistema

Para agregar un nuevo error de Supabase:

```typescript
// auth-errors.ts

const supabaseErrorMap: Record<string, AuthError> = {
  // ... errores existentes ...

  "new_supabase_error": {
    code: "auth/new_code",
    message: "Descripción técnica",
    userMessage: "Mensaje amigable para el usuario",
    action: "Sugerencia de acción",
  },
};
```

## Testing

```typescript
// Test de mapeo de errores
import { mapSupabaseError } from "./errors/auth-errors";

describe("Auth Errors", () => {
  it("maps invalid credentials", () => {
    const error = mapSupabaseError({ message: "Invalid login credentials" });
    expect(error.code).toBe("auth/invalid_credentials");
    expect(error.userMessage).toContain("Email o contraseña incorrectos");
  });

  it("maps unknown errors to generic", () => {
    const error = mapSupabaseError({ message: "Some internal error" });
    expect(error.code).toBe("auth/unknown_error");
    expect(error.userMessage).toContain("Ocurrió un error inesperado");
  });
});
```
