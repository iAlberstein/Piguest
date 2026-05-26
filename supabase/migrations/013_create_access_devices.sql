-- Migration: Create access_devices table
-- Description: Manages access control devices for offline validation
-- Supports device registration and traceability

CREATE TABLE IF NOT EXISTS access_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL,
    device_name TEXT NOT NULL,
    device_identifier TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT access_devices_name_not_empty 
        CHECK (LENGTH(TRIM(device_name)) > 0),
    CONSTRAINT access_devices_identifier_not_empty 
        CHECK (LENGTH(TRIM(device_identifier)) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_access_devices_producer_id ON access_devices(producer_id);
CREATE INDEX idx_access_devices_identifier ON access_devices(device_identifier);
CREATE INDEX idx_access_devices_active ON access_devices(is_active) WHERE is_active = true;
CREATE INDEX idx_access_devices_created_at ON access_devices(created_at DESC);

-- Enable RLS
ALTER TABLE access_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Producers can view their own devices
CREATE POLICY "Producers can view own devices" 
    ON access_devices FOR SELECT 
    USING (producer_id = auth.uid());

-- Producers can create their own devices
CREATE POLICY "Producers can create own devices" 
    ON access_devices FOR INSERT 
    WITH CHECK (producer_id = auth.uid());

-- Producers can update their own devices
CREATE POLICY "Producers can update own devices" 
    ON access_devices FOR UPDATE 
    USING (producer_id = auth.uid());

-- Producers can delete their own devices
CREATE POLICY "Producers can delete own devices" 
    ON access_devices FOR DELETE 
    USING (producer_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_access_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER access_devices_updated_at
    BEFORE UPDATE ON access_devices
    FOR EACH ROW
    EXECUTE FUNCTION update_access_devices_updated_at();

-- Comments for documentation
COMMENT ON TABLE access_devices IS 'Manages access control devices for offline validation and entry management. Supports device registration and traceability.';
COMMENT ON COLUMN access_devices.device_name IS 'Human-readable name for the device (e.g., "Entrada Principal - Tablet 1")';
COMMENT ON COLUMN access_devices.device_identifier IS 'Unique hardware identifier (UUID, serial number, or hardware hash)';
COMMENT ON COLUMN access_devices.is_active IS 'Whether the device is authorized for access control operations';
