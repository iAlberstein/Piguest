/**
 * Manejo centralizado de errores de autenticación.
 *
 * Objetivos:
 * - Mensajes claros para el usuario
 * - Evitar leaks de información interna
 * - UX consistente en toda la app
 * - NO mostrar errores crudos de Supabase
 *
 * @see /docs/auth-errors.md
 */

// ============================================================================
// Tipos de errores
// ============================================================================

export type AuthErrorCode =
  // Errores de validación
  | "validation/error"
  | "validation/invalid_email"
  | "validation/weak_password"
  | "validation/password_mismatch"
  | "validation/invalid_dni"
  // Errores de autenticación
  | "auth/invalid_credentials"
  | "auth/user_not_found"
  | "auth/email_not_confirmed"
  | "auth/user_disabled"
  | "auth/session_expired"
  | "auth/unauthenticated"
  | "auth/forbidden"
  // Errores de registro
  | "auth/email_exists"
  | "auth/dni_exists"
  | "auth/weak_password"
  | "auth/signup_disabled"
  // Errores de password reset
  | "auth/reset_expired"
  | "auth/reset_invalid"
  | "auth/reset_failed"
  // Errores de rate limiting
  | "auth/rate_limit"
  | "auth/too_many_requests"
  // Errores de provider OAuth
  | "auth/provider_error"
  | "auth/callback_error"
  | "auth/user_cancelled"
  // Errores generales
  | "auth/unknown_error"
  | "auth/network_error"
  | "auth/server_error";

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  userMessage: string;
  action?: string;
}

// ============================================================================
// Mapeo de errores Supabase a errores de aplicación
// ============================================================================

/**
 * Mapea errores de Supabase a errores de aplicación seguros.
 * NUNCA exponer errores internos de Supabase al usuario.
 */
const supabaseErrorMap: Record<string, AuthError> = {
  // Credenciales inválidas
  "Invalid login credentials": {
    code: "auth/invalid_credentials",
    message: "Email o contraseña incorrectos",
    userMessage: "Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.",
    action: "Verifica que el email y contraseña sean correctos",
  },
  "invalid_grant": {
    code: "auth/invalid_credentials",
    message: "Credenciales inválidas",
    userMessage: "Email o contraseña incorrectos. Verifica tus datos e intenta nuevamente.",
  },
  // Usuario no existe
  "user_not_found": {
    code: "auth/user_not_found",
    message: "Usuario no encontrado",
    userMessage: "No existe una cuenta con este email. ¿Quieres registrarte?",
    action: "Ir a registro",
  },
  // Email no confirmado
  "email_not_confirmed": {
    code: "auth/email_not_confirmed",
    message: "Email no confirmado",
    userMessage: "Aún no has confirmado tu email. Revisa tu bandeja de entrada y sigue el link de verificación.",
    action: "Reenviar email de confirmación",
  },
  // Email ya existe
  "User already registered": {
    code: "auth/email_exists",
    message: "Email ya registrado",
    userMessage: "Ya existe una cuenta con este email. ¿Quieres iniciar sesión?",
    action: "Ir a login",
  },
  "23505": {
    // PostgreSQL unique violation
    code: "auth/email_exists",
    message: "Email o DNI ya registrado",
    userMessage: "El email o DNI ya están en uso. Si ya tienes cuenta, inicia sesión.",
  },
  // Contraseña débil
  "Password should be at least 6 characters": {
    code: "auth/weak_password",
    message: "Contraseña muy corta",
    userMessage: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.",
  },
  "weak_password": {
    code: "auth/weak_password",
    message: "Contraseña insegura",
    userMessage: "La contraseña es muy débil. Usa al menos 8 caracteres con mayúsculas, minúsculas y números.",
  },
  // Rate limiting
  "over_email_send_rate_limit": {
    code: "auth/rate_limit",
    message: "Demasiados intentos",
    userMessage: "Has realizado demasiados intentos. Por favor espera unos minutos antes de intentar nuevamente.",
  },
  "over_request_rate_limit": {
    code: "auth/rate_limit",
    message: "Demasiadas solicitudes",
    userMessage: "Demasiadas solicitudes. Espera un momento antes de continuar.",
  },
  "too_many_requests": {
    code: "auth/too_many_requests",
    message: "Demasiados intentos",
    userMessage: "Has intentado demasiadas veces. Espera unos minutos o contacta soporte.",
  },
  // Session expired
  "session_expired": {
    code: "auth/session_expired",
    message: "Sesión expirada",
    userMessage: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    action: "Ir a login",
  },
  "token_expired": {
    code: "auth/session_expired",
    message: "Token expirado",
    userMessage: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
  },
  // Reset password
  "invalid_token": {
    code: "auth/reset_invalid",
    message: "Link inválido",
    userMessage: "El link de recuperación no es válido o ha expirado. Solicita uno nuevo.",
    action: "Solicitar nuevo link",
  },
  "signup_disabled": {
    code: "auth/signup_disabled",
    message: "Registro deshabilitado",
    userMessage: "El registro de nuevos usuarios está temporalmente deshabilitado.",
  },
  // Network errors
  "Failed to fetch": {
    code: "auth/network_error",
    message: "Error de conexión",
    userMessage: "No se pudo conectar al servidor. Verifica tu conexión a internet e intenta nuevamente.",
  },
  "NetworkError": {
    code: "auth/network_error",
    message: "Error de red",
    userMessage: "Problema de conexión. Verifica tu internet e intenta de nuevo.",
  },
  // OAuth errors
  "unauthorized_client": {
    code: "auth/provider_error",
    message: "Error de provider OAuth",
    userMessage: "Hubo un problema al conectar con el proveedor de autenticación. Intenta con otro método.",
  },
  "access_denied": {
    code: "auth/user_cancelled",
    message: "Acceso cancelado",
    userMessage: "Cancelaste el inicio de sesión con el proveedor externo.",
  },
};

// ============================================================================
// Funciones de utilidad
// ============================================================================

/**
 * Convierte un error de Supabase en un error de aplicación seguro.
 * Si no reconoce el error, retorna un error genérico para no leak información.
 */
export function mapSupabaseError(error: unknown): AuthError {
  // Si es un error de Supabase con message
  if (error && typeof error === "object" && "message" in error) {
    const errorMessage = (error as { message: string }).message;
    const errorCode = (error as { code?: string }).code;

    // Buscar por mensaje exacto
    if (errorMessage && supabaseErrorMap[errorMessage]) {
      return supabaseErrorMap[errorMessage];
    }

    // Buscar por código de error
    if (errorCode && supabaseErrorMap[errorCode]) {
      return supabaseErrorMap[errorCode];
    }

    // Buscar por substring (para mensajes que pueden variar)
    for (const [key, mappedError] of Object.entries(supabaseErrorMap)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return mappedError;
      }
    }
  }

  // Si es un string
  if (typeof error === "string" && supabaseErrorMap[error]) {
    return supabaseErrorMap[error];
  }

  // Error desconocido - NO leak información interna
  return {
    code: "auth/unknown_error",
    message: "Error inesperado",
    userMessage: "Ocurrió un error inesperado. Por favor intenta nuevamente o contacta soporte si el problema persiste.",
    action: "Intentar nuevamente",
  };
}

/**
 * Crea un error de validación con mensaje claro.
 */
export function createValidationError(
  field: string,
  message: string
): AuthError {
  return {
    code: "validation/error",
    message: `${field}: ${message}`,
    userMessage: message,
  };
}

/**
 * Crea un error de autenticación genérico.
 */
export function createAuthError(
  code: AuthErrorCode,
  userMessage: string,
  action?: string
): AuthError {
  return {
    code,
    message: userMessage,
    userMessage,
    action,
  };
}

// ============================================================================
// Helpers para casos específicos
// ============================================================================

/**
 * Error para usuario no autenticado.
 */
export function unauthenticatedError(): AuthError {
  return {
    code: "auth/unauthenticated",
    message: "No autenticado",
    userMessage: "Debes iniciar sesión para acceder a esta funcionalidad.",
    action: "Ir a login",
  };
}

/**
 * Error para usuario sin permisos.
 */
export function forbiddenError(requiredRole?: string): AuthError {
  return {
    code: "auth/forbidden",
    message: "Sin permisos",
    userMessage: requiredRole
      ? `Necesitas ser ${requiredRole} para acceder aquí.`
      : "No tienes permisos para realizar esta acción.",
    action: "Volver al inicio",
  };
}

/**
 * Error de red genérico.
 */
export function networkError(): AuthError {
  return {
    code: "auth/network_error",
    message: "Error de conexión",
    userMessage: "No se pudo conectar. Verifica tu internet e intenta de nuevo.",
    action: "Reintentar",
  };
}

/**
 * Error del servidor genérico.
 */
export function serverError(): AuthError {
  return {
    code: "auth/server_error",
    message: "Error del servidor",
    userMessage: "Hubo un problema en nuestros servidores. Intenta nuevamente en unos minutos.",
    action: "Reintentar",
  };
}

// ============================================================================
// Formateador de respuestas
// ============================================================================

export interface AuthErrorResponse {
  success: false;
  error: {
    code: AuthErrorCode;
    message: string; // Mensaje técnico (para logs)
    userMessage: string; // Mensaje para mostrar al usuario
    action?: string; // Sugerencia de acción
  };
}

/**
 * Formatea un error para retornar en server actions.
 */
export function formatAuthError(error: unknown): AuthErrorResponse {
  const authError = mapSupabaseError(error);

  return {
    success: false,
    error: {
      code: authError.code,
      message: authError.message, // Para logs/debug
      userMessage: authError.userMessage, // Para UI
      action: authError.action,
    },
  };
}

/**
 * Formatea múltiples errores de validación.
 */
export function formatValidationErrors(
  errors: Array<{ field: string; message: string }>
): AuthErrorResponse {
  const messages = errors.map((e) => `${e.field}: ${e.message}`).join("; ");
  const userMessages = errors.map((e) => e.message).join(". ");

  return {
    success: false,
    error: {
      code: "validation/error",
      message: messages,
      userMessage: `Por favor corrige los siguientes campos: ${userMessages}`,
      action: "Revisar campos marcados",
    },
  };
}
