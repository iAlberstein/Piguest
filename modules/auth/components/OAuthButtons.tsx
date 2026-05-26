"use client";

/**
 * Botones de autenticación OAuth (Google + Apple).
 *
 * Componente reutilizable para login y registro.
 */

import { AppleSignInButton } from "./AppleSignInButton";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface OAuthButtonsProps {
  redirectTo?: string;
  showDivider?: boolean;
}

export function OAuthButtons({
  redirectTo,
  showDivider = true,
}: OAuthButtonsProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <GoogleSignInButton redirectTo={redirectTo} />
      <AppleSignInButton redirectTo={redirectTo} />

      {showDivider && (
        <div className="relative py-1.5 sm:py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-white px-2 text-gray-500">o</span>
          </div>
        </div>
      )}
    </div>
  );
}
