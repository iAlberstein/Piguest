/**
 * Schema de validación para recuperación de contraseña.
 *
 * Usa validadores compartidos de validators.shared.ts para evitar duplicación.
 */

import { z } from "zod";

import { emailValidator, passwordValidator } from "./validators.shared";

/**
 * Schema para solicitar reset de contraseña
 *
 * Valida:
 * - Email: formato válido, obligatorio
 */
export const forgotPasswordSchema = z.object({
  email: emailValidator,
});

/**
 * Schema para confirmar nuevo password
 *
 * Valida:
 * - Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número
 * - Confirmación: debe coincidir con contraseña
 */
export const resetPasswordSchema = z
  .object({
    password: passwordValidator,
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
