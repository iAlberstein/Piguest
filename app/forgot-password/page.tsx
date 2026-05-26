/**
 * Página para solicitar recuperación de contraseña.
 *
 * Ruta: /forgot-password
 *
 * Permite al usuario ingresar su email para recibir
 * un link de recuperación de contraseña.
 */

import Link from "next/link";

import { AuthCard } from "@/modules/auth/components/AuthCard";
import { ForgotPasswordForm } from "@/modules/auth/components/ForgotPasswordForm";

export const metadata = {
  title: "Recuperar contraseña - Piguest",
  description: "Recuperá tu contraseña de Piguest",
};

export default function ForgotPasswordPage() {
  const footer = (
    <Link
      href="/login"
      className="font-medium text-blue-600 hover:text-blue-500"
    >
      Volver al login
    </Link>
  );

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Ingresá tu email y te enviaremos un link para restablecer tu contraseña."
      footer={footer}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
