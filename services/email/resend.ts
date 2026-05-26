import { Resend } from "resend";

/**
 * Instancia singleton del cliente Resend para envío de emails.
 * Se inicializa una única vez y se reutiliza en toda la aplicación.
 *
 * Requiere la variable de entorno RESEND_API_KEY.
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Dominio configurado para envío de emails.
 * Debe verificarse en el dashboard de Resend antes de usar en producción.
 */
export const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "piguest.com";

/**
 * Remitente por defecto para emails de la aplicación.
 */
export const DEFAULT_FROM = `Piguest <no-reply@${EMAIL_DOMAIN}>`;
