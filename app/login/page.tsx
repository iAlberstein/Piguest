/**
 * Página de login.
 *
 * Ruta: /login
 *
 * Permite a usuarios existentes iniciar sesión.
 */

import Link from "next/link";

import { AuthCard } from "@/modules/auth/components/AuthCard";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { OAuthButtons } from "@/modules/auth/components/OAuthButtons";

export const metadata = {
  title: "Login - Piguest",
  description: "Iniciá sesión en tu cuenta de Piguest",
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect } = await searchParams;

  const footer = (
    <div className="space-y-2">
      <p className="text-gray-600">
        ¿No tenés una cuenta?{" "}
        <Link
          href="/registro"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          Registrate
        </Link>
      </p>
      <p>
        <Link
          href="/forgot-password"
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </div>
  );

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Ingresá tus credenciales para continuar"
      footer={footer}
    >
      <OAuthButtons redirectTo={redirect ?? "/"} />
      <LoginForm redirectTo={redirect ?? "/"} />
    </AuthCard>
  );
}
