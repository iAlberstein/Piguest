"use server";

/**
 * Helper para registrar eventos de auditoría.
 *
 * Usa RPC para llamar a la función log_audit_event en Supabase.
 * Payloads seguros: NUNCA incluir contraseñas, tokens o datos sensibles.
 *
 * @see /docs/audit-logs.md
 */

import { createServiceClient } from "@/lib/supabase/server";

import type { AuthRole } from "../types/auth.types";

// ============================================================================
// Tipos de eventos de auditoría
// ============================================================================

export type AuditEventType =
  | "auth.login"
  | "auth.logout"
  | "auth.register"
  | "auth.password_reset"
  | "auth.password_change"
  | "profile.update"
  | "profile.critical_change"
  | "admin.action";

/**
 * Payload seguro para eventos de login
 */
export interface LoginAuditPayload {
  method: "password" | "oauth_google" | "oauth_apple";
  provider?: string;
}

/**
 * Payload para registro
 */
export interface RegisterAuditPayload {
  email: string;
  full_name?: string;
  registration_source?: string;
}

/**
 * Payload para password reset (solo solicitud, no el token)
 */
export interface PasswordResetAuditPayload {
  email: string;
  action: "request" | "confirm";
}

/**
 * Payload para cambios de perfil (versión segura)
 */
export interface ProfileUpdateAuditPayload {
  changed_fields: string[]; // lista de campos modificados, no valores
  before?: {
    full_name?: string;
    phone?: string;
    province?: string;
    locality?: string;
    gender?: string;
  };
  after?: {
    full_name?: string;
    phone?: string;
    province?: string;
    locality?: string;
    gender?: string;
  };
}

/**
 * Payload para cambios críticos de perfil
 */
export interface ProfileCriticalChangePayload {
  changed_field: "email" | "role" | "is_blocked" | "dni";
  before: unknown;
  after: unknown;
  reason?: string; // motivo del cambio (ej: "admin_action", "user_request")
}

/**
 * Payload para acciones de admin
 */
export interface AdminActionPayload {
  action: string;
  target_user_id: string;
  target_user_email?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Helper principal
// ============================================================================

/**
 * Registra un evento de auditoría.
 *
 * @param eventType - Tipo de evento
 * @param actorId - UUID del usuario que realiza la acción
 * @param actorEmail - Email del actor (snapshot)
 * @param actorRole - Rol del actor (snapshot)
 * @param payload - Datos del evento (NO incluir contraseñas/tokens)
 * @param description - Descripción opcional
 * @param targetId - ID del objetivo (si difiere del actor, ej: admin actions)
 */
export async function logAuditEvent(
  eventType: AuditEventType,
  actorId: string,
  actorEmail: string,
  actorRole: AuthRole,
  payload:
    | LoginAuditPayload
    | RegisterAuditPayload
    | PasswordResetAuditPayload
    | ProfileUpdateAuditPayload
    | ProfileCriticalChangePayload
    | AdminActionPayload
    | Record<string, unknown>,
  description?: string,
  targetId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Usar service client para bypass RLS (permite insert aunque el usuario
    // no tenga permisos directos en audit_logs)
    const supabase = await createServiceClient();

    const { error } = await supabase.from("audit_logs").insert({
      event_type: eventType as string,
      event_description: description || null,
      actor_id: actorId,
      actor_email: actorEmail,
      actor_role: actorRole,
      target_id: targetId || actorId,
      target_type: "user",
      payload: payload as Record<string, unknown>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (error) {
      console.error("Error logging audit event:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Exception logging audit event:", message);
    return { success: false, error: message };
  }
}

// ============================================================================
// Helpers específicos para cada tipo de evento
// ============================================================================

/**
 * Registra un login exitoso.
 */
export async function logLogin(
  userId: string,
  email: string,
  role: AuthRole,
  method: LoginAuditPayload["method"],
  provider?: string
): Promise<void> {
  const payload: LoginAuditPayload = {
    method,
    ...(provider && { provider }),
  };

  await logAuditEvent(
    "auth.login",
    userId,
    email,
    role,
    payload,
    `Login exitoso via ${method}`
  );
}

/**
 * Registra un logout.
 */
export async function logLogout(
  userId: string,
  email: string,
  role: AuthRole
): Promise<void> {
  await logAuditEvent(
    "auth.logout",
    userId,
    email,
    role,
    {},
    "Cierre de sesión"
  );
}

/**
 * Registra un registro de nuevo usuario.
 */
export async function logRegister(
  userId: string,
  email: string,
  fullName: string | null,
  role: AuthRole = "ROLE_CUSTOMER",
  source: string = "email"
): Promise<void> {
  const payload: RegisterAuditPayload = {
    email,
    full_name: fullName || undefined,
    registration_source: source,
  };

  await logAuditEvent(
    "auth.register",
    userId,
    email,
    role,
    payload,
    `Nuevo registro via ${source}`
  );
}

/**
 * Registra una solicitud de reset de contraseña.
 */
export async function logPasswordReset(
  userId: string,
  email: string,
  action: "request" | "confirm",
  role: AuthRole = "ROLE_CUSTOMER"
): Promise<void> {
  const payload: PasswordResetAuditPayload = {
    email,
    action,
  };

  await logAuditEvent(
    "auth.password_reset",
    userId,
    email,
    role,
    payload,
    action === "request" ? "Solicitud de reset de contraseña" : "Confirmación de reset de contraseña"
  );
}

/**
 * Registra un cambio de perfil (campos no críticos).
 */
export async function logProfileUpdate(
  userId: string,
  email: string,
  role: AuthRole,
  changedFields: string[],
  before: ProfileUpdateAuditPayload["before"],
  after: ProfileUpdateAuditPayload["after"]
): Promise<void> {
  const payload: ProfileUpdateAuditPayload = {
    changed_fields: changedFields,
    before,
    after,
  };

  await logAuditEvent(
    "profile.update",
    userId,
    email,
    role,
    payload,
    `Perfil actualizado: ${changedFields.join(", ")}`
  );
}

/**
 * Registra un cambio crítico de perfil.
 * IMPORTANTE: Solo usar para email, role, is_blocked, dni
 */
export async function logProfileCriticalChange(
  userId: string,
  email: string,
  role: AuthRole,
  field: ProfileCriticalChangePayload["changed_field"],
  before: unknown,
  after: unknown,
  reason: string = "user_request",
  adminId?: string // Si el cambio fue hecho por un admin
): Promise<void> {
  const payload: ProfileCriticalChangePayload = {
    changed_field: field,
    before,
    after,
    reason,
  };

  await logAuditEvent(
    "profile.critical_change",
    userId,
    email,
    role,
    payload,
    `Cambio crítico de ${field}`,
    adminId || userId
  );
}

/**
 * Registra una acción administrativa.
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  targetUserId: string,
  targetUserEmail: string | undefined,
  details?: Record<string, unknown>
): Promise<void> {
  const payload: AdminActionPayload = {
    action,
    target_user_id: targetUserId,
    target_user_email: targetUserEmail,
    details,
  };

  await logAuditEvent(
    "admin.action",
    adminId,
    adminEmail,
    "ROLE_ADMIN",
    payload,
    `Acción admin: ${action}`,
    targetUserId
  );
}
