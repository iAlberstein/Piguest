# Schemas de Validación Zod

## Estructura

Los schemas están organizados para evitar duplicación mediante validadores compartidos:

```
/modules/auth/forms/
├── validators.shared.ts      # Validadores base reutilizables
├── login.schema.ts           # Schema de login
├── register.schema.ts        # Schema de registro
└── forgot-password.schema.ts # Schemas de recuperación
```

## Validadores Compartidos

### `emailValidator`

```typescript
import { emailValidator } from "./validators.shared";

// Valida:
// - Requerido (no vacío)
// - Formato de email válido
// - Máximo 255 caracteres
```

### `passwordValidator`

```typescript
import { passwordValidator } from "./validators.shared";

// Valida:
// - Mínimo 8 caracteres
// - Máximo 128 caracteres
// - Al menos 1 mayúscula
// - Al menos 1 minúscula
// - Al menos 1 número
```

### `dniValidator`

```typescript
import { dniValidator } from "./validators.shared";

// Valida:
// - Solo números
// - Entre 7 y 9 dígitos
```

### `nameValidator`

```typescript
import { nameValidator } from "./validators.shared";

// Valida:
// - Solo letras (incluye acentos y ñ)
// - Entre 2 y 50 caracteres
```

### `phoneValidator`

```typescript
import { phoneValidator } from "./validators.shared";

// Valida:
// - Formato flexible (números, espacios, guiones, +, paréntesis)
// - Mínimo 8 caracteres
// - Máximo 20 caracteres
// - Opcional (puede ser vacío)
```

### `requiredTextValidator(fieldName)`

```typescript
import { requiredTextValidator } from "./validators.shared";

const provinceValidator = requiredTextValidator("La provincia");
// Valida:
// - No vacío
// - Mínimo 2 caracteres
// - Máximo 100 caracteres
// - Mensaje personalizado: "La provincia es obligatoria"
```

## Schemas por Formulario

### Login

```typescript
import { loginSchema, LoginFormData } from "./forms/login.schema";

const result = loginSchema.safeParse({
  email: "user@example.com",
  password: "password123",
});
```

**Campos:**
| Campo | Validación |
|-------|------------|
| `email` | Requerido, formato email |
| `password` | Requerido (sin validación de fortaleza) |

### Registro

```typescript
import { registerSchema, RegisterFormData } from "./forms/register.schema";

const result = registerSchema.safeParse({
  firstName: "Juan",
  lastName: "Pérez",
  dni: "12345678",
  email: "juan@example.com",
  province: "Buenos Aires",
  locality: "CABA",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
});
```

**Campos:**
| Campo | Validación |
|-------|------------|
| `firstName` | Solo letras, 2-50 caracteres |
| `lastName` | Solo letras, 2-50 caracteres |
| `dni` | 7-9 dígitos, solo números |
| `email` | Formato válido, requerido |
| `province` | Requerido, 2-100 caracteres |
| `locality` | Requerido, 2-100 caracteres |
| `password` | 8+ caracteres, mayúscula, minúscula, número |
| `confirmPassword` | Debe coincidir con password |

### Recuperación de Contraseña

```typescript
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  ForgotPasswordFormData,
  ResetPasswordFormData,
} from "./forms/forgot-password.schema";

// Solicitud de reset
const forgotResult = forgotPasswordSchema.safeParse({
  email: "user@example.com",
});

// Confirmación de nuevo password
const resetResult = resetPasswordSchema.safeParse({
  password: "NewPass123",
  confirmPassword: "NewPass123",
});
```

**Forgot Password:**
| Campo | Validación |
|-------|------------|
| `email` | Formato válido, requerido |

**Reset Password:**
| Campo | Validación |
|-------|------------|
| `password` | 8+ caracteres, mayúscula, minúscula, número |
| `confirmPassword` | Debe coincidir con password |

## Uso en Server Actions

```typescript
"use server";

import { loginSchema } from "../forms/login.schema";

export async function loginAction(credentials: unknown) {
  const validationResult = loginSchema.safeParse(credentials);

  if (!validationResult.success) {
    const errors = validationResult.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );

    return {
      success: false,
      error: {
        code: "validation/error",
        message: errors.join("; "),
      },
    };
  }

  const validatedData = validationResult.data;
  // ... continuar con lógica de login
}
```
## Uso en Client Components

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "./forms/login.schema";

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}
    </form>
  );
}
```

## Mensajes de Error

Todos los validadores incluyen mensajes descriptivos en español:

| Error | Mensaje |
|-------|---------|
| Email vacío | "El email es obligatorio" |
| Email inválido | "Formato de email inválido" |
| Password corto | "La contraseña debe tener al menos 8 caracteres" |
| Password sin mayúscula | "La contraseña debe contener al menos una mayúscula" |
| Password sin número | "La contraseña debe contener al menos un número" |
| DNI corto | "El DNI debe tener al menos 7 dígitos" |
| DNI inválido | "El DNI solo puede contener números" |
| Nombre inválido | "Solo puede contener letras" |
| Contraseñas no coinciden | "Las contraseñas no coinciden" |

## Extender Validadores

Para agregar un nuevo validador compartido:

```typescript
// validators.shared.ts

export const birthDateValidator = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Formato de fecha inválido (YYYY-MM-DD)"
  )
  .optional();
```

Y usar en un schema:

```typescript
// register.schema.ts
import { birthDateValidator } from "./validators.shared";

export const registerSchema = z.object({
  // ... otros campos
  birthDate: birthDateValidator,
});
```
