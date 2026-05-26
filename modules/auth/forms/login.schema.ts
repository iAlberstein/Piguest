/**
 * Schema de validación para login de usuarios.
 *
 * Usa validadores compartidos de validators.shared.ts
 */

import { z } from "zod";

import { emailValidator } from "./validators.shared";

/**
 * Schema de validación para el formulario de login
 *
 * Valida:
 * - Email: requerido, formato válido
 * - Contraseña: requerida (sin validación de fortaleza en login)
 */
export const loginSchema = z.object({
  email: emailValidator,
  password: z.string().min(1, "La contraseña es obligatoria"),
});

/**
 * Tipo inferido del schema de login
 */
export type LoginFormData = z.infer<typeof loginSchema>;
