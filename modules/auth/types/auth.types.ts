/**
 * Tipos oficiales de autenticación para Piguest.
 *
 * Este módulo define las entidades relacionadas con autenticación,
 * sesiones y autorización. Reutiliza tipos base de /types/.
 */

import type { ID, Nullable, Timestamps } from "@/types/global";

// ============================================================================
// Roles y Permisos
// ============================================================================

/**
 * Roles de usuario oficiales del sistema
 *
 * @see BIBLIA.md - PGS-002 Sección 2
 */
export type AuthRole =
  | "ROLE_ADMIN"
  | "ROLE_PRODUCER"
  | "ROLE_STAFF"
  | "ROLE_CUSTOMER";

/**
 * Roles como constantes para uso en runtime
 */
export const AUTH_ROLES = {
  ADMIN: "ROLE_ADMIN" as const,
  PRODUCER: "ROLE_PRODUCER" as const,
  STAFF: "ROLE_STAFF" as const,
  CUSTOMER: "ROLE_CUSTOMER" as const,
};

/**
 * Permisos disponibles en el sistema.
 * Los permisos son más granulares que los roles.
 */
export type AuthPermission =
  // Permisos de eventos
  | "event:create"
  | "event:read"
  | "event:update"
  | "event:delete"
  | "event:publish"
  // Permisos de tickets
  | "ticket:create"
  | "ticket:read"
  | "ticket:validate"
  | "ticket:transfer"
  | "ticket:cancel"
  // Permisos de órdenes
  | "order:create"
  | "order:read"
  | "order:refund"
  // Permisos de usuarios
  | "user:read"
  | "user:update"
  | "user:block"
  // Permisos de productor
  | "producer:read"
  | "producer:update"
  | "producer:staff:manage"
  // Permisos de administración
  | "admin:full"
  | "admin:events:manage"
  | "admin:finance:read"
  | "admin:settings:manage";

/**
 * Mapeo de roles a permisos por defecto
 */
export const ROLE_PERMISSIONS: Record<AuthRole, AuthPermission[]> = {
  ROLE_ADMIN: ["admin:full"],
  ROLE_PRODUCER: [
    "event:create",
    "event:read",
    "event:update",
    "event:delete",
    "event:publish",
    "ticket:read",
    "ticket:validate",
    "order:read",
    "producer:read",
    "producer:update",
    "producer:staff:manage",
  ],
  ROLE_STAFF: [
    "event:read",
    "ticket:read",
    "ticket:validate",
    "order:read",
  ],
  ROLE_CUSTOMER: [
    "event:read",
    "ticket:create",
    "ticket:read",
    "ticket:transfer",
    "order:create",
    "order:read",
    "user:read",
    "user:update",
  ],
};

// ============================================================================
// Entidades de Autenticación
// ============================================================================

/**
 * Usuario de autenticación (datos del sistema de auth de Supabase)
 *
 * Este tipo representa la información que viene del Auth de Supabase,
 * no del perfil extendido en la base de datos.
 */
export interface AuthUser {
  id: ID;
  email: string;
  emailConfirmed: boolean;
  phone: Nullable<string>;
  phoneConfirmed: boolean;
  createdAt: string;
  lastSignInAt: Nullable<string>;
  appMetadata: {
    provider: string;
    providers: string[];
  };
  userMetadata: {
    full_name?: string;
    avatar_url?: string;
  };
  identities: unknown[];
}

/**
 * Usuario en contexto de sesión.
 *
 * Combina datos de auth con el rol mínimo necesario para el middleware
 * y verificaciones de autorización.
 */
export interface SessionUser {
  id: ID;
  email: string;
  role: AuthRole;
  fullName: Nullable<string>;
  isBlocked: boolean;
}

/**
 * Perfil extendido del usuario (almacenado en tabla profiles)
 *
 * @see BIBLIA.md - PGS-003 Tabla profiles
 */
export interface UserProfile extends Timestamps {
  id: ID;
  authUserId: ID;
  email: string;
  fullName: Nullable<string>;
  dni: Nullable<string>;
  role: AuthRole;
  phone: Nullable<string>;
  province: Nullable<string>;
  locality: Nullable<string>;
  birthDate: Nullable<string>;
  gender: Nullable<string>;
  isBlocked: boolean;
}

// ============================================================================
// Sesión y Autenticación
// ============================================================================

/**
 * Estado de la sesión de autenticación
 */
export interface AuthSession {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Estado de autenticación en el cliente
 */
export interface AuthState {
  user: Nullable<SessionUser>;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Nullable<string>;
}

/**
 * Resultado de operación de login/registro
 *
 * Soporta mensajes de error amigables para el usuario
 * @see /modules/auth/errors/auth-errors.ts
 */
export interface AuthResult {
  success: boolean;
  user?: SessionUser;
  error?: {
    code: string;
    message: string; // Mensaje técnico (para logs/debug)
    userMessage?: string; // Mensaje amigable para mostrar al usuario
    action?: string; // Sugerencia de acción a tomar
  };
}

// ============================================================================
// Inputs y Formularios
// ============================================================================

/**
 * Datos para inicio de sesión con email/password
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos para registro de nuevo usuario
 */
export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  province: string;
  locality: string;
  password: string;
  confirmPassword: string;
}

/**
 * Datos para recuperación de contraseña
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Datos para establecer nueva contraseña
 */
export interface PasswordResetConfirmation {
  password: string;
  confirmPassword: string;
}

// ============================================================================
// Providers OAuth
// ============================================================================

/**
 * Providers OAuth soportados
 *
 * @see BIBLIA.md - PGS-002 Sección 1
 */
export type OAuthProvider = "google" | "apple";

/**
 * Configuración de provider OAuth
 */
export interface OAuthConfig {
  provider: OAuthProvider;
  redirectTo: string;
  scopes?: string;
}

// ============================================================================
// Helpers de Type Guards
// ============================================================================

/**
 * Verifica si un valor es un AuthRole válido
 */
export function isAuthRole(role: unknown): role is AuthRole {
  return (
    typeof role === "string" &&
    ["ROLE_ADMIN", "ROLE_PRODUCER", "ROLE_STAFF", "ROLE_CUSTOMER"].includes(
      role
    )
  );
}

/**
 * Verifica si un usuario tiene un rol específico
 */
export function hasRole(
  user: Nullable<SessionUser>,
  role: AuthRole
): boolean {
  return user?.role === role;
}

/**
 * Verifica si un usuario tiene alguno de los roles permitidos
 */
export function hasAnyRole(
  user: Nullable<SessionUser>,
  roles: AuthRole[]
): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Verifica si un usuario tiene un permiso específico
 * basado en su rol asignado.
 */
export function hasPermission(
  user: Nullable<SessionUser>,
  permission: AuthPermission
): boolean {
  if (!user) return false;
  const rolePerms = ROLE_PERMISSIONS[user.role];
  return rolePerms.includes(permission) || rolePerms.includes("admin:full");
}
