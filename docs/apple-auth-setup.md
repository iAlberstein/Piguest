# Configuración de Apple Sign In - Supabase

## Requisitos previos

1. **Apple Developer Account** - Necesitás una cuenta de desarrollador de Apple ($99/año)
2. **Dominio verificado** - Tu dominio debe estar verificado en Apple Developer Portal

## Pasos de configuración

### 1. Configurar en Apple Developer Portal

1. Ir a [Apple Developer Portal](https://developer.apple.com)
2. Navegar a **Certificates, Identifiers & Profiles**
3. Crear un nuevo **Services ID**:
   - Identificador: `com.yourdomain.piguest` (o tu bundle ID)
   - Habilitar **Sign In with Apple**
4. Crear una **Key**:
   - Tipo: Sign in with Apple
   - Descargar el archivo `.p8`
   - Guardar el **Key ID**

### 2. Configurar en Supabase

1. Ir a **Authentication > Providers** en el dashboard de Supabase
2. Buscar **Apple** y habilitarlo
3. Completar los campos:
   - **Services ID**: Tu bundle ID (ej: `com.yourdomain.piguest`)
   - **Key ID**: El ID de la key creada en Apple
   - **Private Key**: El contenido del archivo `.p8` descargado
   - **Team ID**: Tu Apple Team ID (disponible en Membership details)

### 3. URLs de redirección

Supabase automáticamente configura las URLs de callback. Verificar que estén en:
- **Authentication > URL Configuration**
- Site URL: `https://tu-dominio.com`
- Redirect URLs: Incluir `https://tu-dominio.com/auth/callback`

### 4. Variables de entorno

Asegurarse de tener en `.env.local`:

```
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

Para desarrollo local, usar ngrok o similar ya que Apple requiere HTTPS.

## Flujo de autenticación

El flujo ya está implementado en el código:

1. Usuario hace clic en "Continuar con Apple"
2. `signInWithOAuth('apple')` genera URL de autorización
3. Apple autentica al usuario
4. Callback a `/auth/callback?type=oauth`
5. `handleOAuthCallback()` verifica/crea el perfil
6. Sesión establecida automáticamente

## Notas importantes

- **iOS/macOS nativo**: En apps nativas, usar AuthenticationServices framework
- **Web**: El flujo actual funciona en Safari, Chrome, etc.
- **Hide Email**: Apple permite ocultar el email real. Supabase maneja el email proxy.
- **Nombre**: Apple solo envía el nombre completo en el primer login. Después, solo el email.

## Testing

1. Usar Safari para testing (mejor compatibilidad)
2. En desarrollo local, usar ngrok para HTTPS:
   ```bash
   ngrok http 3000
   ```
3. Actualizar el Site URL en Supabase con la URL de ngrok

## Troubleshooting

### "invalid_client"
- Verificar que el Services ID coincida exactamente
- Revisar que la Private Key esté completa (incluyendo headers)

### "redirect_uri_mismatch"
- Verificar que la URL de callback esté registrada en Apple Developer
- La URL debe coincidir exactamente con la configurada

### No se recibe el nombre
- Apple solo envía el nombre en el primer login
- Para testing, revocar el acceso en Settings > Apple ID > Sign-In & Security > Sign in with Apple
