/**
 * Página de registro de usuario.
 *
 * Ruta: /registro
 *
 * Permite a nuevos usuarios crear una cuenta con:
 * - Nombre y apellido
 * - DNI
 * - Email
 * - Provincia y localidad
 * - Contraseña
 */

import Link from "next/link";

import { AuthCard } from "@/modules/auth/components/AuthCard";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";

export const metadata = {
  title: "Registro - Piguest",
  description: "Crea tu cuenta en Piguest",
};

interface RegisterPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const { redirect } = await searchParams;

  const footer = (
    <p className="text-gray-600">
      ¿Ya tenés una cuenta?{" "}
      <Link
        href="/login"
        className="font-medium text-blue-600 hover:text-blue-500"
      >
        Iniciá sesión
      </Link>
    </p>
  );

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Completa tus datos para registrarte"
      footer={footer}
    >
      <RegisterForm redirectTo={redirect ?? "/"} />
    </AuthCard>
  );
}
