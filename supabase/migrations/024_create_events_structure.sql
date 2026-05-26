--
-- Migration: Crear estructura completa de Eventos
--
-- Entidades principales:
-- - events: Espectáculos/obras
-- - event_sessions: Funciones/horarios (reemplaza event_dates)
-- - event_sectors: Sectores de butacas (platea, palcos, pullman)
-- - ticket_types: Tipos de tickets por sector
-- - sale_stages: Etapas de venta con precios
-- - additional_services: Servicios adicionales
-- - promo_codes: Códigos de descuento
-- - ticket_event_sessions: Relación tickets-sesiones
--

-- ============================================
-- 1. TABLA: events (Espectáculos)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL REFERENCES producers(id) ON DELETE CASCADE,
    
    -- Identificación
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    
    -- Descripción
    description TEXT,
    short_description VARCHAR(500),
    
    -- Categorización
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'theater', 'concert', 'comedy', 'dance', 'opera', 'musical', 'workshop', 'festival', 'other'
    )),
    
    -- Metadatos
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    age_rating VARCHAR(10), -- '+16', 'ATP', '+18'
    
    -- Multimedia
    poster_url TEXT,
    backdrop_url TEXT,
    trailer_url TEXT,
    
    -- Estado
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'published', 'on_sale', 'sold_out', 'cancelled', 'completed'
    )),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Constraints adicionales
    CONSTRAINT events_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT events_slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Comentarios
COMMENT ON TABLE events IS 'Espectáculos y eventos creados por productores';
COMMENT ON COLUMN events.slug IS 'URL-friendly identifier, ej: "la-flor-enero-2026"';
COMMENT ON COLUMN events.status IS 'draft→published→on_sale→sold_out→cancelled→completed';

-- ============================================
-- 2. TABLA: event_sessions (Funciones/Horarios)
-- ============================================
CREATE TABLE IF NOT EXISTS event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    room_id UUID, -- Opcional: si el evento tiene sala asignada
    
    -- Identificación de la sesión
    session_label VARCHAR(100), -- Ej: "Función Estreno", "Última función"
    
    -- Tiempos
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ, -- Calculado o manual
    doors_open_at TIMESTAMPTZ, -- Cuándo abren puertas
    
    -- Período de venta
    sale_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sale_ends_at TIMESTAMPTZ,
    
    -- Estado
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'on_sale', 'sold_out', 'cancelled', 'completed'
    )),
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Capacidad y disponibilidad
    total_capacity INTEGER NOT NULL DEFAULT 0,
    available_capacity INTEGER NOT NULL DEFAULT 0,
    sold_count INTEGER NOT NULL DEFAULT 0,
    reserved_count INTEGER NOT NULL DEFAULT 0, -- Bloqueados temporalmente
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT event_sessions_times_valid CHECK (end_time IS NULL OR end_time > start_time),
    CONSTRAINT event_sessions_sale_valid CHECK (sale_ends_at IS NULL OR sale_ends_at > sale_starts_at),
    CONSTRAINT event_sessions_capacity_valid CHECK (total_capacity >= 0),
    CONSTRAINT event_sessions_available_valid CHECK (available_capacity >= 0 AND available_capacity <= total_capacity)
);

COMMENT ON TABLE event_sessions IS 'Funciones individuales de un evento (reemplaza event_dates)';
COMMENT ON COLUMN event_sessions.start_time IS 'Fecha y hora de inicio de la función';
COMMENT ON COLUMN event_sessions.available_capacity IS 'Butacas disponibles para venta (dinámico)';

-- ============================================
-- 3. TABLA: event_sectors (Sectores de Butacas)
-- ============================================
CREATE TABLE IF NOT EXISTS event_sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- Identificación
    name VARCHAR(100) NOT NULL, -- Ej: "Platea General", "Palcos Altos"
    code VARCHAR(50), -- Código corto: "PG", "PA", "PB", "PULL"
    
    -- Tipo de sector
    sector_type VARCHAR(50) NOT NULL CHECK (sector_type IN (
        'platea', 'palcos_bajos', 'palcos_altos', 'pullman', 'vip', 'general'
    )),
    
    -- Descripción
    description TEXT,
    seat_count INTEGER NOT NULL DEFAULT 0,
    
    -- Configuración visual (para layout)
    display_order INTEGER NOT NULL DEFAULT 0,
    color_code VARCHAR(7), -- Color HEX para UI: "#FF5733"
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_numbered BOOLEAN NOT NULL DEFAULT true, -- true = butacas numeradas, false = sin numerar (pullman)
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint único por evento y código
    CONSTRAINT event_sectors_code_unique_per_event UNIQUE (event_id, code)
);

COMMENT ON TABLE event_sectors IS 'Sectores de butacas para un evento (platea, palcos, pullman)';
COMMENT ON COLUMN event_sectors.sector_type IS 'Tipo de sector: platea, palcos_bajos, palcos_altos, pullman, vip, general';
COMMENT ON COLUMN event_sectors.is_numbered IS 'true para sectores con butacas numeradas, false para sin numerar';

-- ============================================
-- 4. TABLA: ticket_types (Tipos de Tickets por Sector)
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sector_id UUID REFERENCES event_sectors(id) ON DELETE SET NULL,
    
    -- Identificación
    name VARCHAR(100) NOT NULL, -- Ej: "Entrada General", "Entrada VIP"
    description TEXT,
    
    -- Precio base
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    
    -- Capacidad asignada a este tipo
    total_quantity INTEGER NOT NULL DEFAULT 0,
    sold_quantity INTEGER NOT NULL DEFAULT 0,
    
    -- Configuración
    min_purchase INTEGER NOT NULL DEFAULT 1 CHECK (min_purchase >= 1),
    max_purchase INTEGER NOT NULL DEFAULT 10 CHECK (max_purchase >= min_purchase),
    
    -- Visibilidad
    is_visible BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ticket_types IS 'Tipos de tickets disponibles por sector y evento';

-- ============================================
-- 5. TABLA: sale_stages (Etapas de Venta)
-- ============================================
CREATE TABLE IF NOT EXISTS sale_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    ticket_type_id UUID NOT NULL REFERENCES ticket_types(id) ON DELETE CASCADE,
    
    -- Identificación
    name VARCHAR(100) NOT NULL, -- Ej: "Preventa", "Venta General", "Últimos Tickets"
    stage_order INTEGER NOT NULL DEFAULT 1, -- Orden de aplicación
    
    -- Período de validez
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    
    -- Precio en esta etapa
    sale_price DECIMAL(10, 2) NOT NULL CHECK (sale_price >= 0),
    original_price DECIMAL(10, 2), -- Para mostrar descuento
    
    -- Límites
    max_tickets INTEGER, -- NULL = ilimitado
    sold_count INTEGER NOT NULL DEFAULT 0,
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT sale_stages_period_valid CHECK (ends_at > starts_at)
);

COMMENT ON TABLE sale_stages IS 'Etapas de venta con precios diferenciados por período';
COMMENT ON COLUMN sale_stages.sale_price IS 'Precio aplicado durante esta etapa';

-- ============================================
-- 6. TABLA: additional_services (Servicios Adicionales)
-- ============================================
CREATE TABLE IF NOT EXISTS additional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- Identificación
    name VARCHAR(100) NOT NULL, -- Ej: "Estacionamiento", "Consumición"
    description TEXT,
    
    -- Precio
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    
    -- Stock
    is_limited BOOLEAN NOT NULL DEFAULT false,
    total_quantity INTEGER,
    available_quantity INTEGER,
    
    -- Configuración
    is_optional BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    max_per_ticket INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE additional_services IS 'Servicios adicionales asociados a un evento';

-- ============================================
-- 7. TABLA: promo_codes (Códigos de Descuento)
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE, -- NULL = válido para todos los eventos
    producer_id UUID REFERENCES producers(id) ON DELETE CASCADE, -- Quién creó el código
    
    -- Identificación
    code VARCHAR(50) NOT NULL UNIQUE, -- Código a ingresar: "VERANO2026"
    description TEXT,
    
    -- Tipo de descuento
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    
    -- Límites
    max_uses INTEGER, -- NULL = ilimitado
    uses_count INTEGER NOT NULL DEFAULT 0,
    max_uses_per_user INTEGER DEFAULT 1,
    
    -- Período de validez
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at TIMESTAMPTZ,
    
    -- Aplicabilidad
    applicable_ticket_types UUID[], -- NULL = todos los tipos
    min_purchase_amount DECIMAL(10, 2),
    
    -- Estado
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT promo_codes_period_valid CHECK (ends_at IS NULL OR ends_at > starts_at),
    CONSTRAINT promo_codes_discount_valid CHECK (
        (discount_type = 'percentage' AND discount_value <= 100) OR
        (discount_type = 'fixed_amount')
    )
);

COMMENT ON TABLE promo_codes IS 'Códigos de descuento para eventos';
COMMENT ON COLUMN promo_codes.discount_type IS 'percentage = % de descuento, fixed_amount = monto fijo';

-- ============================================
-- 8. TABLA: ticket_event_sessions (Relación Tickets-Sesiones)
-- ============================================
-- Reemplaza: ticket_event_dates
CREATE TABLE IF NOT EXISTS ticket_event_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    event_session_id UUID NOT NULL REFERENCES event_sessions(id) ON DELETE CASCADE,
    
    -- Estado específico de este ticket en esta sesión
    seat_number VARCHAR(20), -- Para sectores numerados: "A-12", "PB5-3"
    status VARCHAR(50) NOT NULL DEFAULT 'valid' CHECK (status IN (
        'valid', 'used', 'cancelled', 'refunded', 'transferred'
    )),
    
    -- Validación
    validated_at TIMESTAMPTZ,
    validated_by_profile_id UUID REFERENCES profiles(id),
    validation_method VARCHAR(50), -- 'qr_scan', 'manual_code', 'nfc'
    validation_device_id UUID REFERENCES access_devices(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraint único: un ticket no puede estar en la misma sesión dos veces
    CONSTRAINT ticket_event_sessions_unique UNIQUE (ticket_id, event_session_id)
);

COMMENT ON TABLE ticket_event_sessions IS 'Relación entre tickets y sesiones específicas (reemplaza ticket_event_dates)';
COMMENT ON COLUMN ticket_event_sessions.seat_number IS 'Ubicación específica para esta sesión (si aplica)';

-- ============================================
-- TRIGGERS: updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_sessions_updated_at BEFORE UPDATE ON event_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_sectors_updated_at BEFORE UPDATE ON event_sectors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_types_updated_at BEFORE UPDATE ON ticket_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sale_stages_updated_at BEFORE UPDATE ON sale_stages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_additional_services_updated_at BEFORE UPDATE ON additional_services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_event_sessions_updated_at BEFORE UPDATE ON ticket_event_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
