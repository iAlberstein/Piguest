# REGLAS GLOBALES DE FECHA Y HORA

Piguest utiliza formato regional Argentina.

ESTÁNDAR OBLIGATORIO:

## Fecha

DD/MM/AAAA

Ejemplo:
25/05/2026

## Hora

Formato 24hs.

Ejemplo:
21:30

## Timezone oficial

America/Argentina/Buenos_Aires

## REGLAS OBLIGATORIAS

* TODAS las fechas visibles al usuario deben renderizarse en formato Argentina.
* TODAS las horas visibles deben utilizar formato 24hs.
* NO usar formato AM/PM.
* NO usar formato MM/DD/YYYY.
* TODAS las fechas deben almacenarse en UTC en base de datos.
* TODAS las fechas deben convertirse al timezone Argentina al renderizar.
* Utilizar date-fns para formatting y parsing.
* Centralizar helpers de fecha/hora.
* NO duplicar lógica de formateo.

## HELPERS OFICIALES

Crear helpers reutilizables:

* formatDateAR()
* formatTimeAR()
* formatDateTimeAR()

Toda la app debe utilizar exclusivamente esos helpers.


# PGS-001 — BOOTSTRAP OFICIAL DEL PROYECTO PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer completamente BIBLIA.md,
- respetar arquitectura oficial,
- no improvisar,
- no modificar stack,
- no introducir librerías innecesarias,
- no crear estructuras alternativas.

ESTA ETAPA SOLO CREA:
- estructura base,
- configuración,
- tooling,
- setup inicial.

NO implementar features de negocio.

---

# OBJETIVO

Inicializar proyecto base de Piguest con:
- Next.js,
- TypeScript,
- Tailwind,
- Supabase,
- Resend,
- estructura modular,
- convenciones oficiales.

El resultado debe ser:
- limpio,
- escalable,
- consistente,
- listo para comenzar desarrollo funcional.

---

# STACK OFICIAL

## Frontend
- Next.js latest stable
- TypeScript
- TailwindCSS
- App Router

## Backend
- Supabase

## Hosting
- Vercel

## Mailing
- Resend

---

# INSTRUCCIONES OBLIGATORIAS

## 1. CREAR PROYECTO NEXT

Utilizar:
- Next.js
- TypeScript
- ESLint
- App Router
- Tailwind

NO usar:
- src folder
- turbopack experimental extraño
- pages router

---

# 2. INSTALAR DEPENDENCIAS

Instalar únicamente:

## Core
- @supabase/supabase-js
- @supabase/auth-helpers-nextjs
- clsx
- tailwind-merge
- zod
- react-hook-form

## UI
- lucide-react

## Mailing
- resend

## Utilities
- date-fns

NO instalar:
- Redux
- MobX
- Zustand
- Chakra
- Material UI
- Bootstrap
- Styled Components

NO agregar librerías no solicitadas.

---

# 3. ESTRUCTURA OFICIAL DE CARPETAS

Crear EXACTAMENTE:

/app
/components
/modules
/services
/lib
/hooks
/types
/utils
/styles

Dentro de /modules crear:

/modules/auth
/modules/events
/modules/tickets
/modules/access
/modules/payments
/modules/campaigns
/modules/admin

NO modificar nombres.

---

# 4. CONFIGURAR TAILWIND

Objetivos:
- minimalismo,
- diseño limpio,
- mobile first,
- consistencia visual.

NO usar:
- colores estridentes,
- gradientes excesivos,
- sombras exageradas,
- efectos glassmorphism.

Crear sistema visual neutro y elegante.

---

# 5. CONFIGURAR UTILS

Crear:

## /lib/utils.ts

Implementar:
- cn()
utilizando:
- clsx
- tailwind-merge

NO duplicar utilidades.

---

# 6. CONFIGURAR VARIABLES DE ENTORNO

Crear:
.env.local.example

Definir placeholders para:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=

SIPAGO_API_URL=
SIPAGO_API_KEY=

NO hardcodear secretos.

---

# 7. CONFIGURAR SUPABASE

Crear:

## /lib/supabase/client.ts
Cliente frontend.

## /lib/supabase/server.ts
Cliente server-side.

NO mezclar responsabilidades.

---

# 8. CONFIGURAR RESEND

Crear:

## /services/email/resend.ts

Debe:
- exportar cliente resend,
- estar desacoplado,
- preparado para campañas futuras.

NO implementar emails todavía.

---

# 9. CONFIGURAR TIPOGRAFÍA

Usar:
- Geist o Inter.

Objetivo:
- legibilidad,
- minimalismo,
- aspecto moderno.

---

# 10. CONFIGURAR LAYOUT BASE

Crear layout global minimalista.

Debe incluir:
- background neutro,
- container responsive,
- spacing consistente.

NO crear navbar compleja todavía.

---

# 11. CONFIGURAR ESLINT Y FORMATO

Objetivos:
- código consistente,
- imports ordenados,
- evitar any,
- tipado estricto.

Configurar:
- strict mode TypeScript.

---

# 12. CONFIGURAR TYPES GLOBALES

Crear:

## /types/global.ts

Preparar:
- IDs,
- statuses,
- tipos base.

NO crear tipos de negocio aún.

---

# 13. CREAR PÁGINA TEMPORAL

Crear Home temporal con:

Título:
Piguest

Subtítulo:
Plataforma regional de eventos y accesos.

Diseño:
- minimalista,
- centrado,
- responsive.

NO crear landing final.

---

# 14. REGLAS DE CÓDIGO

OBLIGATORIO:

## Naming

### Componentes
PascalCase

### Variables
camelCase

### Constantes
UPPER_SNAKE_CASE

### Tablas
snake_case

---

# 15. RESTRICCIONES

PROHIBIDO:
- implementar auth,
- implementar eventos,
- implementar dashboard,
- implementar lógica de negocio,
- implementar pagos.

ESTA ETAPA ES SOLO BOOTSTRAP.

---

# 16. RESULTADO ESPERADO

Al finalizar debe existir:

- proyecto funcional,
- estructura limpia,
- arquitectura preparada,
- servidor funcionando,
- Tailwind operativo,
- Supabase conectado,
- Resend configurado,
- tipado estricto,
- base lista para siguientes etapas.

---

# 17. VERIFICACIÓN FINAL

Verificar:
- npm run dev funciona,
- no existen errores TypeScript,
- no existen errores ESLint,
- imports correctos,
- estructura consistente,
- mobile responsive operativo.

NO continuar etapas siguientes automáticamente.

Finalizar implementación al terminar bootstrap.

## GIT
git add .
git commit -m "PGS-001 bootstrap oficial completado"
git tag pgs-001-complete


# PGS-002 — SISTEMA DE AUTENTICACIÓN PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- respetar estructura oficial,
- reutilizar arquitectura existente,
- NO crear estructuras paralelas,
- NO improvisar soluciones.

Esta etapa implementa:
- autenticación,
- sesiones,
- roles,
- protección de rutas.

NO implementar todavía:
- eventos,
- tickets,
- pagos,
- dashboards complejos.

---

# OBJETIVO

Construir sistema de autenticación completo utilizando:
- Supabase Auth,
- Next.js App Router,
- TypeScript estricto.

Debe soportar:
- email/password,
- Google,
- Apple,
- recuperación de contraseña,
- persistencia de sesión,
- roles,
- protección de rutas.

---

# REQUISITOS ARQUITECTÓNICOS

## OBLIGATORIO

Toda autenticación debe centralizarse en:

/modules/auth

NO duplicar lógica auth en:
- pages,
- components,
- hooks dispersos.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/auth/components
/modules/auth/hooks
/modules/auth/services
/modules/auth/types
/modules/auth/utils

---

# 1. CONFIGURAR AUTH PROVIDERS

Configurar Supabase Auth para:

## Login tradicional
- email,
- contraseña.

## OAuth
- Google,
- Apple.

NO agregar otros providers.

---

# 2. CREAR TIPOS OFICIALES

Crear:

## /modules/auth/types/auth.types.ts

Definir:

### UserRole
- ROLE_ADMIN
- ROLE_PRODUCER
- ROLE_STAFF
- ROLE_CUSTOMER

NO usar strings hardcodeados en componentes.

---

# 3. MODELO BASE DE PERFIL

Crear tabla conceptual:

profiles

Campos mínimos:

- id
- email
- full_name
- role
- created_at
- updated_at

NO agregar lógica extra todavía.

NO usar metadata dispersa.

---

# 4. CREAR AUTH SERVICE

Crear:

## /modules/auth/services/auth.service.ts

Responsabilidades:

- login
- register
- logout
- reset password
- get current session
- get current user

NO mezclar UI con lógica.

---

# 5. CREAR AUTH HOOKS

Crear:

## useCurrentUser()
## useRequireAuth()

NO duplicar hooks.

---

# 6. CONFIGURAR MIDDLEWARE

Implementar middleware para:

- persistencia sesión,
- protección de rutas privadas,
- redirecciones.

---

# 7. RUTAS PÚBLICAS

Definir públicas:

/
/login
/register
/forgot-password

---

# 8. RUTAS PRIVADAS

Proteger:

/producer
/admin
/account

---

# 9. CONTROL DE ROLES

Implementar helper centralizado:

## hasRole()

Debe permitir:

- validar permisos,
- restringir rutas,
- reutilizar lógica.

NO hardcodear verificaciones.

---

# 10. CREAR PANTALLA LOGIN

Ruta:
/login

Debe incluir:

- email
- password
- login Google
- login Apple
- link recuperar contraseña
- link registro

Diseño:
- minimalista,
- limpio,
- responsive.

NO agregar branding excesivo.

---

# 11. CREAR PANTALLA REGISTER

Ruta:
/registro

Campos:

- nombre completo
- email
- contraseña
- confirmar contraseña

Validaciones:
- email válido
- contraseña mínima
- confirmación correcta

NO agregar datos extra todavía.

---

# 12. CREAR RECUPERACIÓN CONTRASEÑA

Ruta:
/forgot-password

Flujo:
- ingresar mail,
- enviar recovery email,
- reset password.

---

# 13. VALIDACIONES

Usar:
- zod
- react-hook-form

NO usar validaciones manuales dispersas.

---

# 14. MANEJO DE ERRORES

Crear sistema consistente.

Mensajes:
- claros,
- minimalistas,
- sin errores técnicos expuestos.

NO mostrar:
- stack traces,
- errores internos,
- códigos sensibles.

---

# 15. SESIONES

Implementar:
- persistencia,
- refresh automático,
- recuperación de sesión.

El usuario NO debe perder sesión al refrescar.

---

# 16. USER CONTEXT

Crear provider central:

## AuthProvider

Responsabilidades:
- exponer usuario,
- exponer sesión,
- loading state,
- logout.

NO crear múltiples contexts auth.

---

# 17. UI BASE

Crear componentes reutilizables:

## AuthCard
## AuthInput
## AuthButton

Ubicación:
/modules/auth/components

NO crear componentes gigantes.

---

# 18. REGLAS VISUALES

Mantener:
- minimalismo,
- colores neutros,
- spacing limpio,
- experiencia mobile-first.

NO usar:
- animaciones excesivas,
- gradientes fuertes,
- efectos pesados.

---

# 19. SEGURIDAD

OBLIGATORIO:

- nunca exponer secrets,
- nunca confiar role frontend,
- validar auth server-side,
- sanitizar inputs,
- evitar any.

---

# 20. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- unknown innecesario,
- tipados ambiguos.

---

# 21. RESULTADO ESPERADO

Debe existir:

- login funcional,
- registro funcional,
- recuperación password,
- OAuth Google,
- OAuth Apple,
- sesiones persistentes,
- middleware operativo,
- roles centralizados,
- rutas protegidas.

---

# 22. TEST MANUAL

Verificar:

## Login
- funciona correctamente.

## Logout
- destruye sesión.

## Refresh
- mantiene sesión.

## Middleware
- bloquea privadas.

## OAuth
- inicia correctamente.

## Mobile
- responsive correcto.

---

# 23. RESTRICCIONES

NO implementar:
- dashboards reales,
- lógica eventos,
- tickets,
- pagos,
- campañas.

SOLO AUTH.

---

# 24. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.


# PGS-003 — MODELO OFICIAL DE BASE DE DATOS PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- NO inventar entidades,
- NO cambiar nomenclaturas,
- NO crear estructuras paralelas,
- NO improvisar relaciones.

Esta etapa implementa:
- modelo relacional oficial,
- tablas,
- relaciones,
- enums,
- índices,
- constraints,
- RLS policies base.

NO implementar UI.
NO implementar lógica frontend.
NO implementar dashboards.

---

# OBJETIVO

Construir estructura oficial PostgreSQL/Supabase de Piguest.

El modelo debe ser:
- escalable,
- normalizado,
- consistente,
- auditado,
- preparado para crecimiento regional.

---

# REGLAS OBLIGATORIAS

## Naming

### Tablas
snake_case

### IDs
UUID

### Timestamps
Usar:
- created_at
- updated_at

---

# REGLA CRÍTICA

TODAS las tablas deben incluir:

- created_at
- updated_at

Usar timezone UTC.

---

# ENUMS OFICIALES

## event_status

Valores:
- draft
- published
- hidden
- suspended
- cancelled
- completed

NO agregar otros.

---

## ticket_status

Valores:
- pending
- paid
- cancelled
- refunded
- used
- partially_used

---

## payment_status

Valores:
- pending
- approved
- rejected
- refunded

---

## settlement_status

Valores:
- pending
- processing
- completed
- cancelled

---

## user_role

Valores:
- ROLE_ADMIN
- ROLE_PRODUCER
- ROLE_STAFF
- ROLE_CUSTOMER

---

# TABLA: profiles

Representa usuario del sistema.

Campos:

- id UUID PK
- auth_user_id UUID UNIQUE
- email TEXT UNIQUE
- full_name TEXT
- role user_role
- phone TEXT NULL
- province TEXT NULL
- locality TEXT NULL
- birth_date DATE NULL
- gender TEXT NULL
- is_blocked BOOLEAN DEFAULT FALSE
- created_at
- updated_at

Índices:
- email
- role

---

# TABLA: producer_profiles

Representa productor/organizador.

Campos:

- id UUID PK
- profile_id UUID FK profiles
- display_name TEXT
- legal_name TEXT NULL
- description TEXT NULL
- logo_url TEXT NULL
- instagram_url TEXT NULL
- website_url TEXT NULL
- is_verified BOOLEAN DEFAULT FALSE
- is_blocked BOOLEAN DEFAULT FALSE
- created_at
- updated_at

---

# TABLA: events

Evento principal.

Campos:

- id UUID PK
- producer_profile_id UUID FK
- title TEXT
- slug TEXT UNIQUE
- short_description TEXT
- full_description TEXT
- cover_image_url TEXT
- venue_name TEXT
- venue_address TEXT
- province TEXT
- locality TEXT
- minimum_age INTEGER NULL
- duration_minutes INTEGER NULL
- event_status event_status
- is_hidden BOOLEAN DEFAULT FALSE
- terms_and_conditions TEXT NULL
- created_by UUID FK profiles
- created_at
- updated_at

Índices:
- slug
- event_status
- locality
- province

---

# TABLA: event_dates

Fechas individuales.

Campos:

- id UUID PK
- event_id UUID FK
- starts_at TIMESTAMP
- ends_at TIMESTAMP
- created_at
- updated_at

Índice:
- starts_at

---

# TABLA: event_sectors

Sectores del evento.

Campos:

- id UUID PK
- event_id UUID FK
- name TEXT
- capacity INTEGER
- created_at
- updated_at

Ejemplos:
- General
- VIP
- Camarote

NO implementar butacas numeradas.

---

# TABLA: ticket_types

Tipos de tickets.

Campos:

- id UUID PK
- event_id UUID FK
- event_sector_id UUID FK NULL
- name TEXT
- description TEXT NULL
- max_purchase_per_order INTEGER DEFAULT 6
- is_free BOOLEAN DEFAULT FALSE
- created_at
- updated_at

---

# TABLA: ticket_sale_stages

Preventas/etapas.

Campos:

- id UUID PK
- ticket_type_id UUID FK
- name TEXT
- price NUMERIC(10,2)
- starts_at TIMESTAMP NULL
- ends_at TIMESTAMP NULL
- max_quantity INTEGER NULL
- sold_quantity INTEGER DEFAULT 0
- is_active BOOLEAN DEFAULT TRUE
- created_at
- updated_at

Debe soportar:
- preventa por fecha,
- preventa por cupo,
- preventa mixta.

---

# TABLA: promo_codes

Promociones.

Campos:

- id UUID PK
- event_id UUID FK
- code TEXT UNIQUE
- discount_type TEXT
- discount_value NUMERIC(10,2)
- minimum_quantity INTEGER NULL
- maximum_quantity INTEGER NULL
- max_uses INTEGER NULL
- used_count INTEGER DEFAULT 0
- starts_at TIMESTAMP NULL
- ends_at TIMESTAMP NULL
- is_single_use BOOLEAN DEFAULT FALSE
- is_active BOOLEAN DEFAULT TRUE
- created_at
- updated_at

Debe soportar:
- porcentaje,
- monto fijo,
- 2x1,
- packs.

---

# TABLA: additional_services

Servicios adicionales.

Campos:

- id UUID PK
- event_id UUID FK
- name TEXT
- description TEXT NULL
- price NUMERIC(10,2)
- stock INTEGER NULL
- created_at
- updated_at

Ejemplos:
- estacionamiento
- fotografía
- meet and greet

---

# TABLA: orders

Órdenes de compra.

Campos:

- id UUID PK
- buyer_profile_id UUID FK
- subtotal_amount NUMERIC(10,2)
- service_charge_amount NUMERIC(10,2)
- total_amount NUMERIC(10,2)
- absorb_service_charge BOOLEAN DEFAULT FALSE
- promo_code_id UUID NULL
- created_at
- updated_at

---

# TABLA: payments

Pagos.

Campos:

- id UUID PK
- order_id UUID FK
- provider TEXT
- provider_payment_id TEXT NULL
- payment_status payment_status
- amount NUMERIC(10,2)
- raw_response JSONB NULL
- approved_at TIMESTAMP NULL
- created_at
- updated_at

---

# TABLA: tickets

Ticket emitido.

Campos:

- id UUID PK
- order_id UUID FK NULL
- buyer_profile_id UUID FK
- ticket_type_id UUID FK
- qr_token TEXT UNIQUE
- manual_code TEXT UNIQUE
- ticket_status ticket_status
- holder_full_name TEXT
- holder_dni TEXT
- holder_email TEXT
- created_at
- updated_at

REGLA:
El QR NO contiene lógica.
Solo token seguro.

---

# TABLA: ticket_accesses

Permisos de acceso por fecha.

Campos:

- id UUID PK
- ticket_id UUID FK
- event_date_id UUID FK
- is_used BOOLEAN DEFAULT FALSE
- used_at TIMESTAMP NULL
- created_at
- updated_at

Permite:
- tickets multifecha,
- consumos parciales,
- packs.

---

# TABLA: access_logs

Logs de acreditación.

Campos:

- id UUID PK
- ticket_access_id UUID FK
- validated_by_profile_id UUID FK
- validation_method TEXT
- device_identifier TEXT NULL
- is_offline_validation BOOLEAN DEFAULT FALSE
- created_at
- updated_at

Métodos:
- qr
- manual

---

# TABLA: producer_staff

Relación productor/staff.

Campos:

- id UUID PK
- producer_profile_id UUID FK
- profile_id UUID FK
- created_at
- updated_at

---

# TABLA: settlements

Liquidaciones.

Campos:

- id UUID PK
- producer_profile_id UUID FK
- event_id UUID FK
- gross_amount NUMERIC(10,2)
- platform_fee_amount NUMERIC(10,2)
- net_amount NUMERIC(10,2)
- settlement_status settlement_status
- settled_at TIMESTAMP NULL
- created_at
- updated_at

---

# TABLA: campaigns

Campañas internas.

Campos:

- id UUID PK
- producer_profile_id UUID FK NULL
- title TEXT
- subject TEXT
- content TEXT
- scheduled_at TIMESTAMP NULL
- sent_at TIMESTAMP NULL
- created_by UUID FK profiles
- created_at
- updated_at

---

# TABLA: audit_logs

Auditoría global.

Campos:

- id UUID PK
- actor_profile_id UUID FK
- entity_type TEXT
- entity_id UUID
- action TEXT
- payload JSONB NULL
- ip_address TEXT NULL
- created_at
- updated_at

OBLIGATORIO:
Toda acción sensible debe registrarse.

---

# ÍNDICES OBLIGATORIOS

Crear índices para:

## events
- slug
- locality
- province
- event_status

## tickets
- qr_token
- manual_code

## promo_codes
- code

## payments
- payment_status

## audit_logs
- entity_type
- entity_id

---

# CONSTRAINTS OBLIGATORIOS

Implementar:
- foreign keys,
- cascade donde corresponda,
- restricciones de unicidad,
- validaciones básicas.

NO dejar relaciones ambiguas.

---

# ROW LEVEL SECURITY (RLS)

Activar RLS en TODAS las tablas.

---

# POLÍTICAS BASE

## CUSTOMER
Puede:
- ver sus tickets,
- ver sus órdenes,
- ver su perfil.

---

## PRODUCER
Puede:
- gestionar SUS eventos,
- ver SUS ventas,
- ver SUS asistentes.

---

## STAFF
Puede:
- validar accesos,
- ver asistentes relacionados.

---

## ADMIN
Acceso total.

---

# MIGRACIONES

Generar:
- migraciones limpias,
- ordenadas,
- idempotentes.

NO generar SQL desordenado.

---

# TYPES

Generar types automáticos Supabase.

Ubicación:
/types/database.ts

NO crear types manuales duplicados.

---

# VERIFICACIONES FINALES

Verificar:

- relaciones correctas,
- enums correctos,
- índices correctos,
- RLS activo,
- migrations ejecutables,
- no existen tablas duplicadas,
- no existen nombres inconsistentes.

---

# RESTRICCIONES

NO implementar:
- frontend complejo,
- dashboards,
- lógica checkout,
- lógica QR visual.

SOLO BASE DE DATOS.

---

# FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.


# PGS-004 — SISTEMA DE EVENTOS PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar estructura existente,
- reutilizar tipos oficiales,
- reutilizar servicios oficiales,
- NO inventar arquitecturas nuevas,
- NO modificar tablas existentes,
- NO duplicar lógica.

Esta etapa implementa:
- CRUD de eventos,
- múltiples fechas,
- sectores,
- ticket types,
- preventas,
- servicios adicionales,
- publicación.

NO implementar checkout.
NO implementar pagos.
NO implementar QR.
NO implementar campañas.

---

# OBJETIVO

Construir sistema completo de gestión de eventos para productores.

El productor debe poder:
- crear eventos,
- editarlos,
- publicarlos,
- ocultarlos,
- configurar fechas,
- configurar sectores,
- configurar tickets,
- configurar preventas,
- configurar servicios adicionales.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/events/components
/modules/events/forms
/modules/events/hooks
/modules/events/services
/modules/events/types
/modules/events/utils
/modules/events/actions

---

# REGLA ARQUITECTÓNICA

Toda lógica de eventos debe vivir exclusivamente dentro de:

/modules/events

NO dispersar:
- validaciones,
- schemas,
- servicios,
- helpers.

---

# 1. CREAR EVENT TYPES

Crear:

## /modules/events/types/event.types.ts

Definir:
- Event
- EventDate
- EventSector
- TicketType
- TicketSaleStage
- AdditionalService

Usar:
- types generados desde Supabase.

NO crear duplicaciones.

---

# 2. CREAR EVENT SCHEMAS

Usar:
- zod

Crear:

## event.schema.ts

Debe validar:

- título,
- slug,
- descripción,
- fechas,
- sectores,
- capacidades,
- preventas,
- servicios.

---

# 3. REGLAS OBLIGATORIAS DE EVENTO

## title
Requerido.

## slug
Único.

Generar automáticamente desde título.

Debe permitir override manual.

---

## short_description
Máximo 240 caracteres.

---

## full_description
Rich text simple.

NO usar editor complejo todavía.

---

## venue_name
Obligatorio.

---

## venue_address
Obligatorio.

---

## province
Obligatorio.

---

## locality
Obligatorio.

---

## minimum_age
Opcional.

---

## duration_minutes
Opcional.

---

# 4. EVENT STATUS

SOLO usar:

- draft
- published
- hidden
- suspended
- cancelled
- completed

NO inventar estados nuevos.

---

# 5. CREAR EVENT SERVICE

Crear:

## /modules/events/services/event.service.ts

Responsabilidades:

- createEvent
- updateEvent
- deleteEvent
- publishEvent
- hideEvent
- getEventBySlug
- getProducerEvents
- searchEvents

NO mezclar UI.

---

# 6. CREAR EVENT FORM

Crear formulario modular.

Separar secciones:

## Información general
## Fechas
## Sectores
## Tickets
## Preventas
## Servicios adicionales
## Publicación

NO crear formulario monolítico gigante.

---

# 7. FECHAS MÚLTIPLES

Debe soportar:

- fecha única,
- múltiples fechas,
- festivales,
- talleres recurrentes.

Cada fecha:
- starts_at
- ends_at

---

# 8. SECTORES

Debe permitir:

- múltiples sectores,
- cupos independientes.

NO implementar butacas numeradas.

---

# 9. TICKET TYPES

Cada evento puede tener:

- múltiples tipos de ticket.

Ejemplos:
- General
- VIP
- Early Bird
- Pack Festival

---

# 10. EVENTOS GRATUITOS

Debe soportarse:

## is_free

Cuando:
- ticket type gratuito,
- NO checkout pago,
- emisión directa posterior.

NO implementar emisión todavía.

---

# 11. PREVENTAS

Debe permitir:

## Por fecha
## Por cantidad
## Mixtas

Ejemplos:

50 entradas hasta fecha X.

---

# 12. PROMOCIONES

Crear estructura visual para:

- códigos descuento,
- 2x1,
- packs.

NO implementar lógica checkout todavía.

---

# 13. SERVICIOS ADICIONALES

Debe permitir agregar:

- estacionamiento,
- fotografía,
- meet and greet,
- merchandising,
- etc.

Cada servicio:
- nombre,
- descripción,
- precio,
- stock opcional.

---

# 14. EVENTOS OCULTOS

Implementar:

## hidden event

Eventos:
- visibles solo por link,
- no visibles en agenda pública.

---

# 15. SUBIDA DE IMÁGENES

Usar:
- Supabase Storage.

Crear:
- upload service desacoplado.

Permitir:
- portada evento.

NO implementar galerías todavía.

---

# 16. URLS

Usar:

/eventos/[slug]

NO usar IDs públicos.

---

# 17. PÁGINA PÚBLICA EVENTO

Crear vista pública básica.

Debe mostrar:

- portada,
- título,
- descripción,
- fechas,
- sectores,
- ticket types,
- servicios adicionales.

NO implementar checkout aún.

---

# 18. DASHBOARD PRODUCTOR

Crear rutas:

/producer/events
/producer/events/new
/producer/events/[id]

Funcionalidades:
- listar eventos,
- crear,
- editar.

---

# 19. FILTROS

Implementar:

- estado,
- fecha,
- localidad.

---

# 20. SEARCH

Crear búsqueda básica:

- título,
- localidad,
- productor.

NO implementar search avanzado todavía.

---

# 21. VALIDACIONES

Usar:
- zod,
- react-hook-form.

NO validaciones manuales dispersas.

---

# 22. CONTROL DE PERMISOS

Productor:
- solo puede modificar SUS eventos.

Admin:
- acceso total.

---

# 23. AUDITORÍA

Registrar:

- creación,
- edición,
- publicación,
- ocultamiento,
- eliminación.

Usar:
audit_logs.

---

# 24. UI

Mantener:

- minimalismo,
- neutralidad,
- mobile-first,
- spacing consistente.

NO usar:
- dashboards recargados,
- cards excesivas,
- animaciones innecesarias.

---

# 25. COMPONENTES REUTILIZABLES

Crear:

## EventCard
## EventStatusBadge
## EventDateList
## SectorList
## TicketTypeCard

NO duplicar UI.

---

# 26. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- lógica ambigua,
- tipos duplicados.

---

# 27. PERFORMANCE

Evitar:
- queries innecesarias,
- nested fetches gigantes,
- renderizados redundantes.

---

# 28. RESULTADO ESPERADO

Debe existir:

- CRUD eventos funcional,
- múltiples fechas,
- sectores,
- ticket types,
- preventas,
- servicios adicionales,
- página pública,
- dashboard productor básico,
- upload imágenes,
- permisos correctos.

---

# 29. RESTRICCIONES

NO implementar:
- pagos,
- QR,
- tickets reales,
- acreditación,
- campañas,
- analytics.

SOLO SISTEMA DE EVENTOS.

---

# 30. VERIFICACIÓN FINAL

Verificar:

- creación correcta,
- edición correcta,
- permisos correctos,
- imágenes correctas,
- relaciones correctas,
- mobile responsive,
- tipos correctos,
- auditoría funcionando.

---

# 31. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.


# PGS-005 — SISTEMA DE TICKETS Y EMISIÓN PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- reutilizar módulos existentes,
- reutilizar database types,
- NO modificar estructura de eventos,
- NO duplicar lógica.

Esta etapa implementa:
- generación de tickets,
- QR,
- códigos manuales,
- emisión,
- tickets gratuitos,
- tickets pagos,
- accesos multifecha.

NO implementar pagos reales todavía.
NO implementar validación QR todavía.
NO implementar checkout final todavía.

---

# OBJETIVO

Construir sistema oficial de tickets de Piguest.

El sistema debe:
- emitir tickets únicos,
- soportar múltiples fechas,
- soportar tickets gratuitos,
- generar QR seguros,
- generar códigos manuales,
- preparar sistema de accesos.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/tickets/components
/modules/tickets/services
/modules/tickets/utils
/modules/tickets/types
/modules/tickets/hooks
/modules/tickets/actions

---

# REGLA ARQUITECTÓNICA

Toda lógica tickets debe vivir exclusivamente en:

/modules/tickets

NO dispersar lógica en:
- pages,
- components globales,
- hooks externos.

---

# 1. CREAR TYPES

Crear:

## /modules/tickets/types/ticket.types.ts

Definir:
- Ticket
- TicketAccess
- TicketStatus
- TicketGenerationPayload
- TicketValidationPayload

Usar:
- types Supabase.

NO duplicar entidades manualmente.

---

# 2. CREAR QR TOKEN GENERATOR

Crear:

## generateQrToken()

Reglas:

- token aleatorio seguro,
- longitud consistente,
- imposible de predecir.

Formato recomendado:
pgt_xxxxxxxxx

NO usar:
- IDs secuenciales,
- timestamps visibles,
- datos usuario.

---

# 3. CREAR MANUAL CODE GENERATOR

Crear:

## generateManualCode()

Formato:
- corto,
- legible,
- uppercase.

Ejemplo:
PGT-82KF9

Debe ser:
- único,
- fácilmente tipeable.

---

# 4. REGLA QR

EL QR:
- NO contiene lógica,
- NO contiene datos personales,
- NO contiene estados,
- NO contiene permisos.

El QR SOLO contiene:
- token seguro.

---

# 5. CREAR TICKET SERVICE

Crear:

## /modules/tickets/services/ticket.service.ts

Responsabilidades:

- createTicket
- generateTicketAccesses
- getTicketByQr
- getTicketByManualCode
- getUserTickets
- issueFreeTicket
- issuePaidTicket

NO mezclar UI.

---

# 6. TICKETS GRATUITOS

Implementar flujo:

## FREE FLOW

Cuando:
- ticket_type.is_free = true

Entonces:
- NO crear payment,
- NO usar Sipago,
- emitir ticket automáticamente.

Debe:
- respetar cupos,
- respetar límites por compra,
- registrar orden.

---

# 7. TICKETS PAGOS

Preparar flujo para:

## PAID FLOW

Debe:
- crear orden pendiente,
- preparar emisión posterior.

NO completar pago aún.

---

# 8. TICKET ACCESS

Implementar generación automática de:

ticket_accesses

Cada access representa:
- permiso individual de ingreso.

---

# 9. MULTIFECHA

Debe soportar:

## Ticket simple
1 fecha.

## Ticket pack
Múltiples fechas.

---

# 10. CONSUMO PARCIAL

El sistema debe soportar:

Ejemplo:
Festival 3 días.

- viernes usado,
- sábado pendiente,
- domingo pendiente.

---

# 11. TICKET STATUS

SOLO usar:

- pending
- paid
- cancelled
- refunded
- used
- partially_used

NO inventar estados nuevos.

---

# 12. PDF TICKET

Crear generación básica de ticket visual.

Debe incluir:

- nombre evento,
- fechas,
- QR,
- código manual,
- titular,
- sectores.

NO diseñar branding final todavía.

---

# 13. EMAIL DELIVERY

Preparar envío mediante Resend.

Crear:

## sendTicketEmail()

NO crear campañas aún.

---

# 14. PÁGINA MIS ENTRADAS

Crear:

/account/tickets

Mostrar:

- próximos eventos,
- tickets activos,
- tickets usados.

---

# 15. PÁGINA TICKET DETAIL

Ruta:

/tickets/[id]

Mostrar:

- QR,
- código manual,
- evento,
- fechas,
- estado.

---

# 16. QR VISUAL

Usar librería simple y estable.

NO usar:
- librerías gigantes,
- canvas innecesario,
- animaciones.

---

# 17. REGLAS DNI

El ticket:
- almacena DNI,
- pero es al portador.

NO bloquear transferencias informales.

NO implementar transferencias oficiales aún.

---

# 18. LIMITES DE COMPRA

Respetar:

max_purchase_per_order

Default:
6.

---

# 19. CUPOS

Validar:

- stock disponible,
- capacidad sector,
- capacidad preventa.

NO permitir overselling.

---

# 20. CONCURRENCIA

Implementar protección básica para:

- múltiples compras simultáneas.

Evitar:
- doble emisión,
- sobreventa.

---

# 21. AUDITORÍA

Registrar:

- emisión ticket,
- cancelación,
- reembolso,
- regeneración.

Usar:
audit_logs.

---

# 22. SEGURIDAD

OBLIGATORIO:

- nunca exponer lógica QR,
- validar backend,
- evitar predictibilidad,
- sanitizar inputs.

---

# 23. UI

Mantener:
- minimalismo,
- legibilidad,
- mobile-first.

El QR debe verse:
- claro,
- grande,
- escaneable.

---

# 24. COMPONENTES REUTILIZABLES

Crear:

## TicketCard
## TicketQRCode
## TicketStatusBadge
## TicketAccessList

NO duplicar UI.

---

# 25. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- tipos ambiguos,
- lógica duplicada.

---

# 26. PERFORMANCE

Optimizar:

- consultas tickets,
- render QR,
- carga de PDFs.

---

# 27. RESULTADO ESPERADO

Debe existir:

- tickets únicos,
- QR seguro,
- código manual,
- tickets gratuitos,
- estructura tickets pagos,
- ticket accesses,
- soporte multifecha,
- página tickets usuario,
- emails preparados.

---

# 28. RESTRICCIONES

NO implementar:
- Sipago real,
- checkout final,
- validación QR real,
- offline mode.

SOLO SISTEMA DE TICKETS.

---

# 29. VERIFICACIÓN FINAL

Verificar:

- QR únicos,
- manual codes únicos,
- multifecha correcto,
- ticket accesses correctos,
- cupos correctos,
- mobile correcto,
- PDFs correctos.

---

# 30. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.


# PGS-006 — CHECKOUT Y PAGOS PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- reutilizar módulos existentes,
- reutilizar services y types,
- NO modificar entidades previas,
- NO duplicar lógica.

Esta etapa implementa:
- checkout,
- órdenes,
- integración Sipago,
- promociones,
- service charge,
- emisión posterior al pago.

NO implementar validación QR aún.
NO implementar offline mode aún.

---

# OBJETIVO

Construir flujo oficial de compra de Piguest.

El sistema debe permitir:
- seleccionar tickets,
- agregar servicios,
- aplicar promociones,
- calcular service charge,
- pagar mediante Sipago,
- emitir tickets automáticamente luego de pago aprobado.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/payments/components
/modules/payments/services
/modules/payments/hooks
/modules/payments/utils
/modules/payments/types
/modules/payments/actions

---

# REGLA ARQUITECTÓNICA

Toda lógica de checkout/pagos debe vivir exclusivamente en:

/modules/payments

NO mezclar:
- lógica tickets,
- lógica eventos,
- lógica UI pública.

---

# 1. CREAR TYPES

Crear:

## /modules/payments/types/payment.types.ts

Definir:
- Order
- Payment
- CheckoutPayload
- ServiceChargeCalculation
- PromoValidationResult

Usar:
- types Supabase.

---

# 2. CREAR CHECKOUT FLOW

Flujo oficial:

1. Usuario selecciona tickets
2. Usuario selecciona servicios
3. Sistema valida stock
4. Sistema calcula totales
5. Sistema aplica promociones
6. Sistema calcula service charge
7. Sistema crea order
8. Usuario paga Sipago
9. Sipago confirma
10. Sistema emite tickets

NO alterar flujo.

---

# 3. CREAR CART STATE

Implementar carrito centralizado.

Debe soportar:

- múltiples ticket types,
- múltiples fechas,
- servicios adicionales,
- promociones.

---

# 4. REGLAS SERVICE CHARGE

Debe soportar:

## absorb_by_producer
El productor absorbe comisión.

## absorb_by_customer
El cliente paga comisión.

NO usar otras nomenclaturas.

---

# 5. CALCULADORA DE TOTALES

Crear:

## calculateCheckoutTotals()

Debe calcular:

- subtotal,
- descuentos,
- service charge,
- total final.

Todo cálculo debe ocurrir backend-side también.

NO confiar frontend.

---

# 6. PROMOCIONES

Implementar soporte para:

- porcentaje,
- monto fijo,
- 2x1,
- packs múltiples,
- códigos únicos,
- límites uso,
- fechas validez.

---

# 7. VALIDACIÓN PROMOS

Crear:

## validatePromoCode()

Debe validar:

- vigencia,
- límite usos,
- evento correcto,
- cantidad mínima,
- cantidad máxima.

NO permitir promociones inválidas.

---

# 8. CUPOS

Validar SIEMPRE:

- preventa,
- sector,
- ticket type,
- evento.

NO permitir overselling.

---

# 9. ORDENES

Crear órdenes antes del pago.

Estado inicial:
pending.

---

# 10. SIPAGO SERVICE

Crear:

## /modules/payments/services/sipago.service.ts

Responsabilidades:

- createPayment
- validatePayment
- handleWebhook

NO mezclar checkout.

---

# 11. WEBHOOKS

Crear endpoint seguro:

/api/webhooks/sipago

Debe:

- validar autenticidad,
- actualizar payment,
- emitir tickets,
- registrar auditoría.

NUNCA confiar payload sin validación.

---

# 12. EMISIÓN POST-PAGO

SOLO emitir tickets cuando:

payment_status = approved

NO emitir antes.

---

# 13. FREE FLOW

Cuando ticket gratuito:

- bypass Sipago,
- emitir directo.

Mantener:
- order,
- auditoría.

---

# 14. CHECKOUT UI

Crear experiencia minimalista.

Pantallas:

## Resumen
## Datos comprador
## Promoción
## Pago

---

# 15. DATOS COMPRADOR

Obligatorios:

- nombre
- apellido
- DNI
- email
- provincia
- localidad

Opcionales:
- teléfono
- fecha nacimiento
- género

---

# 16. VALIDACIONES

Usar:
- zod
- react-hook-form

NO validaciones dispersas.

---

# 17. RESERVA TEMPORAL

Implementar hold temporal de stock.

Objetivo:
evitar overselling durante checkout.

Tiempo recomendado:
10 minutos.

---

# 18. EXPIRACIÓN ÓRDENES

Orden pendiente debe:
- expirar automáticamente,
- liberar stock.

---

# 19. EMAIL CONFIRMACIÓN

Enviar:
- confirmación compra,
- tickets adjuntos.

Usar:
Resend.

---

# 20. PÁGINA SUCCESS

Ruta:
/checkout/success

Mostrar:
- compra exitosa,
- resumen,
- tickets.

---

# 21. PÁGINA FAILURE

Ruta:
/checkout/failure

Mostrar:
- error pago,
- reintento.

---

# 22. PÁGINA PENDING

Ruta:
/checkout/pending

Mostrar:
- pago pendiente validación.

---

# 23. SEGURIDAD

OBLIGATORIO:

- validar montos backend,
- validar stock backend,
- validar promos backend,
- validar payment backend.

NO confiar frontend.

---

# 24. AUDITORÍA

Registrar:

- creación orden,
- aplicación promo,
- pago aprobado,
- pago rechazado,
- emisión tickets.

Usar:
audit_logs.

---

# 25. COMPONENTES REUTILIZABLES

Crear:

## CheckoutSummary
## PromoCodeInput
## PaymentButton
## OrderDetails
## ServiceChargeBreakdown

NO duplicar UI.

---

# 26. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- lógica ambigua,
- cálculos inconsistentes.

---

# 27. PERFORMANCE

Optimizar:
- cálculos checkout,
- validaciones,
- webhooks,
- emisión tickets.

---

# 28. RESULTADO ESPERADO

Debe existir:

- checkout funcional,
- carrito,
- promos,
- service charge,
- Sipago integrado,
- webhooks,
- emisión automática,
- stock protegido,
- expiración órdenes.

---

# 29. RESTRICCIONES

NO implementar:
- validación QR,
- offline mode,
- analytics avanzados.

SOLO CHECKOUT Y PAGOS.

---

# 30. VERIFICACIÓN FINAL

Verificar:

- cálculos correctos,
- promos correctas,
- stock correcto,
- pagos correctos,
- emisión correcta,
- expiración correcta,
- emails correctos.

---

# 31. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.

# PGS-007 — SISTEMA DE ACCESOS Y VALIDACIÓN QR PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- reutilizar módulos existentes,
- reutilizar ticket_accesses,
- reutilizar access_logs,
- NO duplicar lógica,
- NO modificar estructura tickets.

Esta etapa implementa:
- validación QR,
- validación manual,
- modo offline,
- sincronización,
- control accesos,
- trazabilidad.

NO implementar analytics avanzados aún.

---

# OBJETIVO

Construir sistema oficial de acreditación y acceso de Piguest.

Debe permitir:

- validar QR,
- validar código manual,
- operar offline,
- sincronizar estados,
- prevenir doble ingreso,
- registrar trazabilidad completa.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/access/components
/modules/access/services
/modules/access/hooks
/modules/access/utils
/modules/access/types
/modules/access/actions

---

# REGLA ARQUITECTÓNICA

Toda lógica accesos debe vivir exclusivamente en:

/modules/access

NO mezclar lógica:
- tickets,
- checkout,
- dashboards.

---

# 1. CREAR TYPES

Crear:

## /modules/access/types/access.types.ts

Definir:
- AccessValidationResult
- AccessValidationMethod
- OfflineValidationPayload
- SyncResult

Usar:
types Supabase.

---

# 2. MÉTODOS VALIDACIÓN

Soportar:

## qr
## manual

NO agregar otros métodos.

---

# 3. VALIDACIÓN QR

Crear:

## validateQrToken()

Debe:

1. buscar ticket,
2. validar existencia,
3. validar estado,
4. validar access correspondiente,
5. verificar uso previo,
6. registrar acceso,
7. devolver resultado consistente.

---

# 4. VALIDACIÓN MANUAL

Crear:

## validateManualCode()

Debe:
- replicar misma lógica QR.

NO duplicar lógica interna.

Centralizar validación.

---

# 5. RESULTADOS VALIDACIÓN

Crear respuestas oficiales.

## VALID
Ticket válido.

## ALREADY_USED
Ya utilizado.

## INVALID
No existe.

## CANCELLED
Ticket cancelado.

## WRONG_DATE
No válido para fecha actual.

## ERROR
Fallo inesperado.

NO inventar otros estados.

---

# 6. CONSUMO MULTIFECHA

Debe soportar:

Festival 3 días:
- consumir viernes,
- mantener sábado,
- mantener domingo.

NO invalidar ticket completo prematuramente.

---

# 7. PARTIAL USAGE

Actualizar automáticamente:

## partially_used
## used

Según cantidad consumida.

---

# 8. MODO OFFLINE

OBLIGATORIO.

El sistema debe:

- descargar tickets válidos,
- almacenar localmente,
- permitir validación offline,
- sincronizar luego.

---

# 9. CACHE LOCAL

Implementar:

- IndexedDB o solución estable,
- persistencia local,
- actualización incremental.

NO usar localStorage para dataset completo.

---

# 10. SINCRONIZACIÓN

Crear:

## syncOfflineValidations()

Debe:
- subir validaciones offline,
- resolver conflictos,
- actualizar estados.

---

# 11. CONFLICTOS

Implementar resolución básica.

Ejemplo:
Ticket usado simultáneamente.

Priorizar:
- primer timestamp válido.

Registrar conflictos en auditoría.

---

# 12. APP DE ACCESO

Crear interfaz optimizada mobile.

Rutas:

/access
/access/scanner
/access/manual

---

# 13. ESCÁNER QR

Usar librería:
- estable,
- rápida,
- mobile-friendly.

NO usar librerías pesadas innecesarias.

---

# 14. BÚSQUEDA MANUAL

Debe permitir:

- código manual,
- nombre,
- DNI.

---

# 15. LISTA ASISTENTES

Staff/Productor deben poder:

- buscar asistentes,
- validar manualmente,
- ver estado ingreso.

---

# 16. CONTROL STAFF

Staff:
- solo eventos autorizados.

Producer:
- solo sus eventos.

Admin:
- acceso total.

---

# 17. ACCESS LOGS

Registrar SIEMPRE:

- quién validó,
- cuándo,
- método,
- dispositivo,
- offline/online.

Usar:
access_logs.

---

# 18. AUDITORÍA

Registrar:

- validaciones,
- rechazos,
- conflictos,
- sincronizaciones.

Usar:
audit_logs.

---

# 19. FEEDBACK VISUAL

Validación debe mostrar:

## Verde
Acceso válido.

## Rojo
Acceso inválido.

## Amarillo
Advertencia/conflicto.

Mantener:
- minimalismo,
- claridad,
- alta legibilidad.

---

# 20. LATENCIA

Validación online debe sentirse:
- instantánea.

Optimizar:
- queries,
- índices,
- payloads.

---

# 21. SEGURIDAD

OBLIGATORIO:

- validar backend,
- evitar replay attacks,
- evitar bypass frontend,
- validar permisos staff.

---

# 22. COMPONENTES REUTILIZABLES

Crear:

## QRScanner
## ValidationResultCard
## ManualValidationForm
## AccessLogList
## OfflineSyncStatus

NO duplicar UI.

---

# 23. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- validaciones ambiguas,
- estados inconsistentes.

---

# 24. PERFORMANCE

Optimizar:

- escaneo QR,
- cache local,
- sincronización,
- búsquedas asistentes.

---

# 25. RESULTADO ESPERADO

Debe existir:

- validación QR,
- validación manual,
- modo offline,
- sincronización,
- prevención doble ingreso,
- multifecha correcto,
- logs completos,
- app mobile-friendly.

---

# 26. RESTRICCIONES

NO implementar:
- analytics avanzados,
- campañas,
- BI,
- dashboards complejos.

SOLO SISTEMA DE ACCESOS.

---

# 27. VERIFICACIÓN FINAL

Verificar:

- QR correcto,
- manual correcto,
- offline correcto,
- sync correcto,
- conflictos correctos,
- multifecha correcto,
- mobile correcto.

---

# 28. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.

# PGS-008 — DASHBOARD PRODUCTOR Y ANALYTICS PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- reutilizar módulos existentes,
- reutilizar audit_logs,
- reutilizar events/tickets/payments/access,
- NO duplicar lógica,
- NO modificar estructuras previas.

Esta etapa implementa:
- dashboard productor,
- métricas,
- asistentes,
- ventas,
- campañas internas,
- base de datos clientes,
- herramientas fidelización.

NO implementar BI externo avanzado todavía.

---

# OBJETIVO

Construir el principal diferencial de Piguest:
un dashboard productor potente, claro y útil.

Debe permitir:
- entender ventas,
- entender audiencia,
- gestionar asistentes,
- reutilizar públicos,
- operar eventos,
- generar campañas internas.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/producer-dashboard/components
/modules/producer-dashboard/services
/modules/producer-dashboard/hooks
/modules/producer-dashboard/utils
/modules/producer-dashboard/types
/modules/producer-dashboard/actions

---

# REGLA ARQUITECTÓNICA

Toda lógica dashboard productor debe vivir exclusivamente en:

/modules/producer-dashboard

NO dispersar lógica en:
- events,
- tickets,
- payments.

---

# 1. DASHBOARD HOME

Ruta:

/producer

Mostrar:

- ventas totales,
- tickets vendidos,
- eventos activos,
- próximos eventos,
- ingresos estimados,
- liquidaciones pendientes.

---

# 2. MÉTRICAS PRINCIPALES

Implementar:

## Revenue
## Tickets Sold
## Attendance Rate
## Conversion Rate
## Top Events
## Ticket Type Performance

---

# 3. FILTROS

Debe permitir:

- rango fechas,
- evento,
- localidad,
- estado evento.

---

# 4. EVENT ANALYTICS

Ruta:

/producer/events/[id]/analytics

Mostrar:

- ventas por día,
- evolución preventas,
- sectores,
- ingresos,
- accesos utilizados,
- tickets pendientes.

---

# 5. GRÁFICOS

Usar:
- librería simple,
- liviana,
- consistente.

NO usar dashboards pesados.

---

# 6. ASISTENTES

Ruta:

/producer/events/[id]/attendees

Mostrar:

- nombre,
- DNI,
- email,
- tickets,
- estado acceso.

Permitir:
- búsqueda,
- filtros,
- exportación.

---

# 7. EXPORTACIONES

Permitir exportar:

- CSV
- XLSX

---

# 8. BASE DE DATOS CLIENTES

Crear vista productor de audiencia.

Debe permitir:

- clientes previos,
- historial asistencia,
- historial compras,
- segmentación.

---

# 9. REGLA CRÍTICA

El productor:
- NO obtiene mails directos exportables masivamente fuera reglas plataforma.

Las campañas deben ejecutarse:
- SIEMPRE mediante Piguest.

---

# 10. CAMPAÑAS INTERNAS

Ruta:

/producer/campaigns

Permitir:

- crear campañas,
- elegir audiencia,
- programar envío,
- enviar novedades eventos.

---

# 11. SEGMENTACIÓN

Debe permitir:

- asistentes evento X,
- compradores VIP,
- clientes frecuentes,
- localidad,
- rango fechas.

---

# 12. NEWSLETTERS

Preparar:
- integración Resend,
- plantillas base.

NO implementar diseñador complejo todavía.

---

# 13. PERFORMANCE EVENTOS

Mostrar:

- eventos mejor vendidos,
- eventos agotados,
- tasa conversión,
- recurrencia clientes.

---

# 14. WAITLIST

Mostrar:

- usuarios esperando entradas,
- cantidad,
- conversión posterior.

---

# 15. CORTESÍAS

Dashboard debe permitir:

- emitir,
- ver,
- auditar.

---

# 16. STAFF MANAGEMENT

Ruta:

/producer/staff

Permitir:

- agregar staff,
- remover,
- asignar eventos.

---

# 17. PERMISOS STAFF

Staff:
- solo accesos autorizados.

NO acceso financiero.

---

# 18. LIQUIDACIONES

Ruta:

/producer/settlements

Mostrar:

- ingresos brutos,
- fee plataforma,
- neto,
- estado liquidación.

---

# 19. ESTADOS LIQUIDACIÓN

SOLO usar:

- pending
- processing
- completed
- cancelled

---

# 20. AUDITORÍA

Mostrar historial:

- publicaciones,
- validaciones,
- cortesías,
- cambios precios,
- campañas.

---

# 21. NOTIFICACIONES

Crear centro básico:

- ventas importantes,
- agotados,
- campañas enviadas,
- liquidaciones.

---

# 22. SEARCH GLOBAL

Implementar búsqueda rápida:

- eventos,
- asistentes,
- campañas.

---

# 23. UI

Mantener:
- minimalismo,
- claridad,
- profesionalismo,
- alta legibilidad.

NO crear:
- dashboards recargados,
- exceso widgets,
- animaciones innecesarias.

---

# 24. COMPONENTES REUTILIZABLES

Crear:

## MetricCard
## RevenueChart
## TicketSalesChart
## AttendeeTable
## CampaignCard
## SettlementCard

NO duplicar UI.

---

# 25. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- cálculos inconsistentes,
- métricas ambiguas.

---

# 26. PERFORMANCE

Optimizar:
- queries agregadas,
- dashboards,
- gráficos,
- exportaciones.

Usar:
- paginación,
- lazy loading donde corresponda.

---

# 27. SEGURIDAD

OBLIGATORIO:

- productor solo accede sus datos,
- staff restringido,
- validar server-side,
- proteger exportaciones.

---

# 28. RESULTADO ESPERADO

Debe existir:

- dashboard productor completo,
- métricas,
- analytics eventos,
- asistentes,
- campañas,
- segmentación,
- liquidaciones,
- staff management.

---

# 29. RESTRICCIONES

NO implementar:
- app mobile nativa,
- BI externo,
- machine learning,
- recomendaciones IA.

SOLO DASHBOARD PRODUCTOR.

---

# 30. VERIFICACIÓN FINAL

Verificar:

- métricas correctas,
- gráficos correctos,
- campañas correctas,
- permisos correctos,
- exportaciones correctas,
- responsive correcto.

---

# 31. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.

# PGS-009 — PANEL ADMINISTRATIVO CENTRAL PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- reutilizar módulos existentes,
- reutilizar audit_logs,
- reutilizar dashboards previos,
- NO duplicar lógica,
- NO modificar entidades existentes.

Esta etapa implementa:
- panel administrador global,
- moderación,
- supervisión,
- gestión productores,
- control financiero,
- auditoría global.

NO implementar automatizaciones IA todavía.

---

# OBJETIVO

Construir panel administrativo central de Piguest.

Debe permitir:
- supervisar toda la plataforma,
- moderar contenido,
- bloquear usuarios,
- gestionar productores,
- controlar liquidaciones,
- visualizar actividad global,
- mantener trazabilidad completa.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/admin/components
/modules/admin/services
/modules/admin/hooks
/modules/admin/utils
/modules/admin/types
/modules/admin/actions

---

# REGLA ARQUITECTÓNICA

Toda lógica administrativa debe vivir exclusivamente en:

/modules/admin

NO dispersar:
- permisos admin,
- moderación,
- auditorías.

---

# 1. CONTROL DE ACCESO

SOLO:
ROLE_ADMIN

Puede acceder a:

/admin

Validar:
server-side.

---

# 2. DASHBOARD ADMIN

Ruta:

/admin

Mostrar:

- ventas globales,
- tickets emitidos,
- eventos activos,
- eventos ocultos,
- productores activos,
- usuarios registrados,
- ingresos plataforma.

---

# 3. MODERACIÓN EVENTOS

Ruta:

/admin/events

Permitir:

- ocultar eventos,
- suspender eventos,
- cancelar eventos,
- destacar eventos,
- revisar eventos denunciados.

---

# 4. EVENT STATUS

SOLO usar:

- draft
- published
- hidden
- suspended
- cancelled
- completed

NO crear estados nuevos.

---

# 5. MODERACIÓN PRODUCTORES

Ruta:

/admin/producers

Permitir:

- verificar productor,
- bloquear productor,
- suspender productor,
- revisar actividad.

---

# 6. BLOQUEOS

Implementar:

## is_blocked

Debe impedir:
- login,
- publicación,
- ventas,
- validaciones.

---

# 7. USUARIOS

Ruta:

/admin/users

Mostrar:

- usuarios,
- roles,
- actividad,
- tickets,
- compras.

Permitir:
- bloqueo,
- desbloqueo.

---

# 8. AUDITORÍA GLOBAL

Ruta:

/admin/audit

Mostrar:

- actor,
- acción,
- entidad,
- timestamp,
- payload.

Filtrar por:
- usuario,
- evento,
- acción.

---

# 9. LIQUIDACIONES

Ruta:

/admin/settlements

Permitir:

- generar liquidaciones,
- aprobar,
- marcar completadas,
- cancelar.

---

# 10. REPORTES FINANCIEROS

Mostrar:

- revenue plataforma,
- service charges,
- ingresos productores,
- pagos pendientes,
- pagos rechazados.

---

# 11. GESTIÓN CAMPAÑAS

Ruta:

/admin/campaigns

Permitir:

- campañas globales,
- newsletters regionales,
- destacados semanales.

---

# 12. DESTACADOS

Implementar:

## featured events

Eventos destacados visibles homepage.

---

# 13. CONTENIDO HOMEPAGE

Crear administración para:

- banners,
- destacados,
- categorías.

---

# 14. WAITLIST GLOBAL

Mostrar:

- eventos con mayor demanda,
- listas espera,
- conversión posterior.

---

# 15. DENUNCIAS

Preparar estructura:

## reports

Usuarios podrán denunciar:
- eventos,
- productores.

NO implementar flujo complejo todavía.

---

# 16. STAFF ADMIN

Preparar soporte futuro:

- subadmins,
- moderadores.

NO implementar granularidad avanzada todavía.

---

# 17. LOGS CRÍTICOS

Registrar SIEMPRE:

- bloqueos,
- desbloqueos,
- suspensiones,
- liquidaciones,
- campañas.

Usar:
audit_logs.

---

# 18. SEARCH GLOBAL

Implementar búsqueda admin:

- usuarios,
- eventos,
- productores,
- órdenes.

---

# 19. FILTROS

Implementar:

- fechas,
- estados,
- localidades,
- productores.

---

# 20. DASHBOARD OPERATIVO

Mostrar:

- errores pagos,
- tickets inválidos,
- conflictos validación,
- eventos próximos.

---

# 21. ALERTAS

Crear alertas básicas:

- eventos agotados,
- múltiples rechazos,
- conflictos accesos,
- productores suspendidos.

---

# 22. EXPORTACIONES

Permitir:

- CSV
- XLSX

Para:
- ventas,
- productores,
- eventos,
- asistentes.

---

# 23. UI

Mantener:
- profesionalismo,
- minimalismo,
- legibilidad.

NO crear:
- panel recargado,
- exceso gráficos,
- efectos innecesarios.

---

# 24. COMPONENTES REUTILIZABLES

Crear:

## AdminMetricCard
## AuditTable
## ProducerStatusBadge
## EventModerationCard
## SettlementTable

NO duplicar UI.

---

# 25. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- permisos ambiguos,
- estados inconsistentes.

---

# 26. SEGURIDAD

OBLIGATORIO:

- validar role backend,
- proteger rutas admin,
- registrar acciones sensibles,
- evitar escalación permisos.

---

# 27. PERFORMANCE

Optimizar:

- queries admin,
- filtros,
- auditorías,
- exportaciones.

Usar:
- paginación,
- índices,
- lazy loading.

---

# 28. RESULTADO ESPERADO

Debe existir:

- panel admin completo,
- moderación,
- control productores,
- control usuarios,
- liquidaciones,
- auditoría global,
- campañas globales,
- destacados homepage.

---

# 29. RESTRICCIONES

NO implementar:
- IA automatizada,
- scoring automático,
- moderación automática ML.

SOLO PANEL ADMIN.

---

# 30. VERIFICACIÓN FINAL

Verificar:

- permisos correctos,
- moderación correcta,
- auditoría correcta,
- liquidaciones correctas,
- exportaciones correctas,
- responsive correcto.

---

# 31. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.

# PGS-010 — LANDING PÚBLICA Y EXPERIENCIA USUARIO PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- reutilizar arquitectura oficial,
- reutilizar módulos existentes,
- reutilizar featured events,
- reutilizar eventos publicados,
- NO duplicar lógica,
- NO modificar modelos previos.

Esta etapa implementa:
- homepage pública,
- agenda regional,
- exploración eventos,
- búsqueda pública,
- perfiles productores,
- waitlist,
- newsletters.

NO implementar SEO avanzado todavía.

---

# OBJETIVO

Construir experiencia pública principal de Piguest.

La plataforma debe sentirse:
- moderna,
- minimalista,
- regional,
- clara,
- rápida,
- orientada descubrimiento eventos.

Debe funcionar como:
- ticketera,
- agenda regional,
- punto conexión productores/público.

---

# ESTRUCTURA OBLIGATORIA

Crear EXACTAMENTE:

/modules/public
/modules/public/components
/modules/public/services
/modules/public/hooks
/modules/public/utils
/modules/public/types

---

# REGLA ARQUITECTÓNICA

Toda lógica pública debe vivir en:

/modules/public

NO dispersar:
- búsquedas,
- featured,
- newsletters,
- agenda.

---

# 1. HOMEPAGE

Ruta:

/

Debe incluir:

## Hero minimalista
## Buscador principal
## Eventos destacados
## Próximos eventos
## Categorías
## Agenda semanal
## Newsletter signup

---

# 2. HERO

Minimalista.

Mostrar:
- marca Piguest,
- subtítulo regional,
- buscador principal.

NO usar:
- sliders gigantes,
- videos autoplay,
- efectos pesados.

---

# 3. BÚSQUEDA PRINCIPAL

Debe buscar:

- eventos,
- localidades,
- productores.

Autocomplete básico.

---

# 4. EVENTOS DESTACADOS

Consumir:
featured events admin.

---

# 5. PRÓXIMOS EVENTOS

Ordenar por:
fecha próxima.

Excluir:
- hidden
- suspended
- cancelled.

---

# 6. CATEGORÍAS

Implementar categorías visuales:

- recitales
- talleres
- cursos
- fiestas
- festivales
- teatro
- otros

---

# 7. AGENDA SEMANAL

Crear:
agenda regional.

Mostrar:
- eventos próximos,
- agrupados por día.

---

# 8. EXPLORADOR EVENTOS

Ruta:

/eventos

Implementar:
- grid/list,
- filtros,
- búsqueda.

---

# 9. FILTROS

Permitir:

- fecha,
- categoría,
- localidad,
- gratuito/pago.

---

# 10. EVENT DETAIL

Mejorar página evento existente.

Agregar:

- mapa simple,
- productor,
- fechas,
- sectores,
- servicios,
- entradas disponibles,
- waitlist.

---

# 11. PRODUCTOR PÚBLICO

Ruta:

/productores/[slug]

Mostrar:

- perfil productor,
- próximos eventos,
- eventos pasados.

---

# 12. WAITLIST

Implementar flujo:

Cuando evento agotado:
- usuario deja mail,
- recibe notificación si vuelve stock.

---

# 13. NEWSLETTER

Implementar signup público.

Objetivos:
- eventos semana,
- destacados regionales,
- próximos eventos.

---

# 14. NEWSLETTER PREFERENCES

Permitir:

- localidad,
- categorías interés.

---

# 15. FAVORITOS

Preparar soporte:

## favorite_events

NO implementar social todavía.

---

# 16. SHARE

Implementar compartir:

- WhatsApp
- Facebook
- X/Twitter

Minimalista.

---

# 17. SEO BÁSICO

Implementar:

- metadata,
- open graph,
- titles dinámicos.

NO implementar SEO complejo aún.

---

# 18. PERFORMANCE

Optimizar:

- imágenes,
- eventos,
- homepage.

Usar:
- lazy loading,
- next/image,
- caching.

---

# 19. RESPONSIVE

OBLIGATORIO.

Experiencia mobile-first.

Especial atención:
- búsqueda,
- checkout entry,
- agenda.

---

# 20. EMPTY STATES

Crear estados vacíos claros.

Ejemplos:
- sin eventos,
- sin resultados,
- waitlist vacía.

---

# 21. UI

Mantener:
- minimalismo,
- neutralidad,
- legibilidad,
- foco contenido.

NO usar:
- exceso animaciones,
- carousels complejos,
- efectos pesados.

---

# 22. COMPONENTES REUTILIZABLES

Crear:

## HeroSearch
## EventGrid
## FeaturedEventCard
## WeeklyAgenda
## NewsletterSignup
## WaitlistForm
## ProducerPublicCard

NO duplicar UI.

---

# 23. TYPESCRIPT

STRICT MODE obligatorio.

PROHIBIDO:
- any,
- filtros inconsistentes,
- estados ambiguos.

---

# 24. ANALYTICS BÁSICOS

Registrar:

- vistas evento,
- búsquedas,
- clicks destacados,
- waitlists.

---

# 25. SEGURIDAD

OBLIGATORIO:

- sanitizar búsqueda,
- validar formularios,
- evitar scraping trivial.

---

# 26. RESULTADO ESPERADO

Debe existir:

- homepage moderna,
- agenda regional,
- búsqueda,
- explorador eventos,
- productor público,
- waitlist,
- newsletters,
- responsive completo.

---

# 27. RESTRICCIONES

NO implementar:
- app nativa,
- social network,
- recomendaciones IA,
- chat.

SOLO EXPERIENCIA PÚBLICA.

---

# 28. VERIFICACIÓN FINAL

Verificar:

- homepage correcta,
- búsquedas correctas,
- filtros correctos,
- responsive correcto,
- performance correcta,
- waitlist correcta.

---

# 29. FINALIZACIÓN

Cuando termine:
- detener implementación,
- no continuar automáticamente,
- esperar próxima etapa.

# PGS-011 — HARDENING, SEGURIDAD Y PREPARACIÓN PRODUCCIÓN PIGUEST

## CONTEXTO OBLIGATORIO

ANTES DE EJECUTAR:
- leer COMPLETAMENTE BIBLIA.md,
- revisar TODAS las etapas previas,
- NO modificar arquitectura oficial,
- NO crear estructuras paralelas,
- NO improvisar herramientas nuevas.

Esta etapa implementa:
- hardening,
- QA,
- seguridad,
- optimización,
- preparación producción,
- observabilidad,
- estabilidad final MVP.

NO implementar features nuevas.

---

# OBJETIVO

Preparar Piguest para entorno real de producción.

El sistema debe quedar:
- estable,
- seguro,
- consistente,
- optimizado,
- mantenible,
- deployable.

---

# REGLA CRÍTICA

ESTA ETAPA:
- NO agrega features,
- SOLO mejora calidad,
- estabilidad,
- seguridad,
- rendimiento.

---

# 1. REVISIÓN GLOBAL

Revisar TODO el proyecto:

- estructura,
- naming,
- tipado,
- imports,
- duplicaciones,
- inconsistencias.

Eliminar:
- código muerto,
- archivos no usados,
- componentes duplicados.

---

# 2. TYPESCRIPT

STRICT MODE obligatorio global.

Eliminar:
- any,
- casts inseguros,
- tipos ambiguos.

---

# 3. ESLINT

Resolver:
- warnings,
- imports inconsistentes,
- dependencias incorrectas.

Proyecto debe quedar:
0 errores.

---

# 4. SEGURIDAD AUTH

Verificar:

- middleware,
- sesiones,
- permisos,
- validaciones server-side.

Asegurar:
- productores NO acceden otros productores,
- staff restringido,
- admin protegido.

---

# 5. RLS

Auditar TODAS las policies Supabase.

Verificar:
- acceso correcto,
- escalación imposible,
- lecturas restringidas.

---

# 6. VALIDACIONES

Verificar TODOS los forms.

Asegurar:
- zod consistente,
- sanitización,
- manejo errores correcto.

---

# 7. RATE LIMITING

Implementar protección básica:

- login,
- checkout,
- QR validation,
- webhooks.

---

# 8. WEBHOOK SECURITY

Validar:
- firmas Sipago,
- replay protection,
- payload verification.

---

# 9. QR SECURITY

Verificar:
- tokens impredecibles,
- no exposición datos,
- validación backend obligatoria.

---

# 10. PERFORMANCE

Optimizar:

- queries,
- joins,
- imágenes,
- dashboards,
- homepage.

Agregar:
- índices faltantes,
- paginación,
- caching razonable.

---

# 11. DATABASE REVIEW

Verificar:

- índices,
- constraints,
- relaciones,
- cascades,
- enums.

---

# 12. ERROR HANDLING

Centralizar manejo errores.

Crear:
- errores consistentes,
- mensajes claros,
- logs estructurados.

NO mostrar:
- stack traces,
- errores internos sensibles.

---

# 13. LOGGING

Implementar logs consistentes para:

- auth,
- pagos,
- accesos,
- campañas,
- errores críticos.

---

# 14. OBSERVABILIDAD

Preparar estructura para:

- monitoring,
- alertas,
- métricas.

NO integrar herramientas complejas aún.

---

# 15. EMPTY STATES

Revisar TODOS los estados vacíos.

Debe existir UX correcta para:
- sin eventos,
- sin tickets,
- sin campañas,
- errores.

---

# 16. LOADING STATES

Agregar:
- skeletons,
- loaders,
- estados transición.

Evitar:
- pantallas congeladas.

---

# 17. RESPONSIVE FINAL

Auditar:
- mobile,
- tablet,
- desktop.

Especial atención:
- checkout,
- scanner,
- dashboards.

---

# 18. ACCESSIBILITY

Implementar base accesibilidad:

- labels,
- focus states,
- contraste correcto,
- navegación teclado.

---

# 19. SEO BÁSICO FINAL

Verificar:
- titles,
- metadata,
- OG tags,
- canonical URLs.

---

# 20. EMAIL REVIEW

Verificar:
- templates,
- branding,
- links,
- errores.

---

# 21. STORAGE REVIEW

Auditar:
- uploads,
- permisos archivos,
- tamaños,
- naming consistente.

---

# 22. ENVIRONMENT VARIABLES

Verificar:
- no secrets hardcodeados,
- .env.example actualizado,
- separación dev/prod.

---

# 23. BUILD OPTIMIZATION

Verificar:

- build limpia,
- bundle razonable,
- imports optimizados.

---

# 24. DEPLOY READY

Preparar:
- Vercel deployment,
- variables entorno,
- Supabase production.

---

# 25. TESTS MANUALES

Checklist completo:

## AUTH
## EVENTS
## TICKETS
## PAYMENTS
## ACCESS
## DASHBOARDS
## ADMIN
## PUBLIC

---

# 26. ESCENARIOS CRÍTICOS

Probar:

- pago rechazado,
- doble escaneo,
- checkout expirado,
- ticket agotado,
- offline sync,
- productor bloqueado.

---

# 27. AUDITORÍA FINAL

Verificar:
audit_logs
access_logs

Deben registrar correctamente.

---

# 28. UX FINAL

Revisar:

- consistencia visual,
- spacing,
- typography,
- navegación.

Mantener:
- minimalismo,
- claridad,
- velocidad.

---

# 29. DOCUMENTACIÓN

Actualizar:

- README,
- setup local,
- variables entorno,
- deploy.

---

# 30. RESULTADO ESPERADO

Piguest debe quedar:

- funcional,
- estable,
- segura,
- deployable,
- coherente,
- lista para MVP real.

---

# 31. RESTRICCIONES

NO implementar:
- features nuevas,
- refactors gigantes,
- cambios arquitectura.

SOLO HARDENING FINAL.

---

# 32. VERIFICACIÓN FINAL

Verificar:

- build production,
- cero errores TS,
- cero errores ESLint,
- responsive completo,
- seguridad correcta,
- performance correcta.

---

# 33. FINALIZACIÓN

Cuando termine:
- detener implementación,
- esperar instrucciones futuras.

