"use server";

/**
 * Server Action para registro de usuarios.
 *
 * Responsabilidades:
 * - Validar datos con zod schema
 * - Verificar DNI único
 * - Verificar email único
 * - Crear usuario en Supabase Auth
 * - Crear perfil en tabla profiles
 */

import { createServiceClient } from "@/lib/supabase/server";

import {
  formatAuthError,
  formatValidationErrors,
} from "../errors/auth-errors";
import { registerSchema } from "../forms/register.schema";
import { logRegister } from "../helpers/audit.helper";

import type { AuthResult, RegisterCredentials } from "../types/auth.types";

/**
 * Verifica si un DNI ya está registrado
 */
async function checkDniExists(
  dni: string,
  client: Awaited<ReturnType<typeof createServiceClient>>
): Promise<boolean> {
  const { data } = await client
    .from("profiles")
    .select("id")
    .eq("dni", dni)
    .single();

  return !!data;
}

/**
 * Verifica si un email ya está registrado
 */
async function checkEmailExists(
  email: string,
  client: Awaited<ReturnType<typeof createServiceClient>>
): Promise<boolean> {
  const { data } = await client
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  return !!data;
}

/**
 * Registra un nuevo usuario en el sistema.
 *
 * Flujo:
 * 1. Valida datos con schema
 * 2. Verifica DNI único
 * 3. Verifica email único
 * 4. Crea usuario en Supabase Auth
 * 5. Crea perfil en tabla profiles
 *
 * @param formData - Datos del formulario de registro
 * @returns Resultado de la operación
 */
export async function registerAction(
  formData: RegisterCredentials
): Promise<AuthResult> {
  try {
    // 1. Validar datos con schema
    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      return formatValidationErrors(
        validationResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }))
      );
    }

    const validatedData = validationResult.data;
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`;

    const serviceClient = await createServiceClient();

    // 2. Verificar DNI único
    const dniExists = await checkDniExists(validatedData.dni, serviceClient);
    if (dniExists) {
      return {
        success: false,
        error: {
          code: "auth/dni_exists",
          message: "DNI ya registrado",
          userMessage: "Ya existe una cuenta con este DNI. Si ya tienes cuenta, inicia sesión.",
          action: "Ir a login",
        },
      };
    }

    // 3. Verificar email único
    const emailExists = await checkEmailExists(
      validatedData.email,
      serviceClient
    );
    if (emailExists) {
      return {
        success: false,
        error: {
          code: "auth/email_exists",
          message: "Email ya registrado",
          userMessage: "Ya existe una cuenta con este email. Si ya tienes cuenta, inicia sesión.",
          action: "Ir a login",
        },
      };
    }

    // 4. Crear usuario en Supabase Auth
    const { data: authData, error: authError } =
      await serviceClient.auth.admin.createUser({
        email: validatedData.email,
        password: validatedData.password,
        email_confirm: false,
        user_metadata: {
          full_name: fullName,
        },
      });

    if (authError || !authData.user) {
      console.error("Registration auth error:", authError);
      return formatAuthError(authError);
    }

    // 5. Crear perfil en tabla profiles
    const { error: profileError } = await serviceClient
      .from("profiles")
      .insert([
        {
          auth_user_id: authData.user.id,
          email: validatedData.email,
          full_name: fullName,
          dni: validatedData.dni,
          role: "ROLE_CUSTOMER" as const,
          phone: null,
          province: validatedData.province,
          locality: validatedData.locality,
          birth_date: null,
          gender: null,
          is_blocked: false,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as any);

    if (profileError) {
      // Rollback: eliminar usuario de auth si falla la creación del perfil
      await serviceClient.auth.admin.deleteUser(authData.user.id);

      console.error("Profile creation error:", profileError);
      return {
        success: false,
        error: {
          code: "profile/creation_failed",
          message: "Error al crear el perfil",
          userMessage: "Hubo un problema al completar tu registro. Por favor intenta nuevamente.",
          action: "Reintentar registro",
        },
      };
    }

    // Registrar evento de auditoría
    void logRegister(
      authData.user.id,
      validatedData.email,
      fullName,
      "ROLE_CUSTOMER",
      "email"
    );

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: validatedData.email,
        role: "ROLE_CUSTOMER",
        fullName: fullName,
        isBlocked: false,
      },
    };
  } catch (error) {
    console.error("Unexpected registration error:", error);
    return formatAuthError(error);
  }
}
