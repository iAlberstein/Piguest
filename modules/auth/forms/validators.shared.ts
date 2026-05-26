/**
 * Validaciones Zod compartidas para evitar duplicación.
 *
 * Estas validaciones son reutilizables en múltiples schemas.
 */

import { z } from "zod";

// ============================================================================
// Validadores base (primitivos)
// ============================================================================

/**
 * Validación de email.
 * Requerido, formato válido.
 */
export const emailValidator = z
  .string()
  .min(1, "El email es obligatorio")
  .email("Formato de email inválido")
  .max(255, "El email no puede exceder 255 caracteres");

/**
 * Validación de contraseña segura.
 * Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número.
 */
export const passwordValidator = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128, "La contraseña no puede exceder 128 caracteres")
  .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
  .regex(/\d/, "La contraseña debe contener al menos un número");

/**
 * Validación de DNI argentino.
 * Solo números, entre 7 y 9 dígitos.
 */
export const dniValidator = z
  .string()
  .min(7, "El DNI debe tener al menos 7 dígitos")
  .max(9, "El DNI no puede exceder 9 dígitos")
  .regex(/^\d+$/, "El DNI solo puede contener números");

/**
 * Validación de nombre/apellido.
 * Solo letras (incluye acentos y ñ), entre 2 y 50 caracteres.
 */
export const nameValidator = z
  .string()
  .min(2, "Debe tener al menos 2 caracteres")
  .max(50, "No puede exceder 50 caracteres")
  .regex(
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
    "Solo puede contener letras"
  );

/**
 * Validación de teléfono.
 * Formato flexible para números argentinos.
 */
export const phoneValidator = z
  .string()
  .regex(
    /^[\d\s\-\+\(\)]+$/,
    "Formato de teléfono inválido"
  )
  .min(8, "Teléfono demasiado corto")
  .max(20, "Teléfono demasiado largo")
  .optional()
  .or(z.literal(""));

/**
 * Validación de texto obligatorio.
 * Para campos como provincia, localidad.
 */
export const requiredTextValidator = (fieldName: string) =>
  z
    .string()
    .min(1, `${fieldName} es obligatorio`)
    .min(2, `${fieldName} debe tener al menos 2 caracteres`)
    .max(100, `${fieldName} no puede exceder 100 caracteres`);

// ============================================================================
// Helpers para schemas
// ============================================================================

/**
 * Crea un schema de confirmación de contraseña.
 * Valida que password y confirmPassword coincidan.
 */
export const withPasswordConfirmation = <T extends { password: string }>(
  schema: z.ZodType<T>
) =>
  schema instanceof z.ZodObject
    ? schema
        .extend({
          confirmPassword: z.string().min(1, "Debes confirmar la contraseña"),
        })
        .refine((data) => data.password === (data as { confirmPassword: string }).confirmPassword, {
          message: "Las contraseñas no coinciden",
          path: ["confirmPassword"],
        })
    : schema;

// ============================================================================
// Mensajes de error comunes
// ============================================================================

export const errorMessages = {
  required: (field: string) => `${field} es obligatorio`,
  minLength: (field: string, min: number) =>
    `${field} debe tener al menos ${min} caracteres`,
  maxLength: (field: string, max: number) =>
    `${field} no puede exceder ${max} caracteres`,
  invalidFormat: (field: string) => `Formato de ${field} inválido`,
  onlyNumbers: (field: string) => `${field} solo puede contener números`,
  onlyLetters: (field: string) => `${field} solo puede contener letras`,
} as const;
