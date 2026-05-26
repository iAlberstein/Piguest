/**
 * Schema de validación para registro de usuarios.
 *
 * Usa validadores compartidos de validators.shared.ts para evitar duplicación.
 *
 * Valida:
 * - DNI: 7-9 dígitos, solo números
 * - Email: formato válido, obligatorio
 * - Nombre/Apellido: solo letras, 2-50 caracteres
 * - Provincia/Localidad: obligatorios
 * - Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número
 */

import { z } from "zod";

import {
  dniValidator,
  emailValidator,
  nameValidator,
  passwordValidator,
  requiredTextValidator,
} from "./validators.shared";

/**
 * Schema de validación para el formulario de registro
 */
export const registerSchema = z
  .object({
    firstName: nameValidator,
    lastName: nameValidator,
    dni: dniValidator,
    email: emailValidator,
    province: requiredTextValidator("La provincia"),
    locality: requiredTextValidator("La localidad"),
    password: passwordValidator,
    confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

/**
 * Tipo inferido del schema de registro
 */
export type RegisterFormData = z.infer<typeof registerSchema>;
