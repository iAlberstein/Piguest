import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rutas públicas que no requieren autenticación
 */
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/registro",
  "/forgot-password",
  "/auth/callback",
];

/**
 * Prefijos de rutas públicas (API, assets, etc.)
 */
const PUBLIC_PREFIXES = [
  "/_next",
  "/api/public",
  "/favicon",
  "/public",
];

/**
 * Verifica si una ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Middleware global de autenticación
 *
 * Responsabilidades:
 * - Mantener persistencia de sesión (refresh token automático)
 * - Proteger rutas privadas
 * - Inyectar cliente Supabase en requests
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refrescar sesión si existe (persistencia automática)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Proteger rutas privadas
  const pathname = request.nextUrl.pathname;

  if (!isPublicRoute(pathname) && !session) {
    // Redirigir a login si intenta acceder a ruta privada sin sesión
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

/**
 * Configuración del matcher del middleware
 *
 * Excluye:
 * - Archivos estáticos (imágenes, fonts, etc.)
 * - API routes que manejan su propia auth
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
