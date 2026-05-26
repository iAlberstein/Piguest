-- Migration: Create ticket_validations table
-- Description: Records all ticket validations with full traceability
-- Supports QR scanning, manual entry, offline sync, and device tracking

CREATE TABLE IF NOT EXISTS ticket_validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    validated_by_profile_id UUID NOT NULL,
    event_date_id UUID,
    validation_method TEXT NOT NULL,
    validated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_identifier TEXT,
    is_offline_sync BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ticket_validations_method_check 
        CHECK (validation_method IN ('qr_scan', 'manual_code', 'rfid', 'nfc', 'biometric'))
);

-- Indexes for common queries
CREATE INDEX idx_ticket_validations_ticket_id ON ticket_validations(ticket_id);
CREATE INDEX idx_ticket_validations_validated_by ON ticket_validations(validated_by_profile_id);
CREATE INDEX idx_ticket_validations_event_date ON ticket_validations(event_date_id) WHERE event_date_id IS NOT NULL;
CREATE INDEX idx_ticket_validations_method ON ticket_validations(validation_method);
CREATE INDEX idx_ticket_validations_validated_at ON ticket_validations(validated_at DESC);
CREATE INDEX idx_ticket_validations_offline_sync ON ticket_validations(is_offline_sync) WHERE is_offline_sync = true;
CREATE INDEX idx_ticket_validations_device ON ticket_validations(device_identifier) WHERE device_identifier IS NOT NULL;

-- Enable RLS
ALTER TABLE ticket_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Staff can view all validations for events they manage
CREATE POLICY "Staff can view event validations" 
    ON ticket_validations FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_validations.ticket_id 
            AND validated_by_profile_id = auth.uid()
        )
    );

-- Only authenticated users can create validations
CREATE POLICY "Authenticated users can create validations" 
    ON ticket_validations FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only the validator can update their own validations (for corrections)
CREATE POLICY "Validators can update own validations" 
    ON ticket_validations FOR UPDATE 
    USING (validated_by_profile_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE ticket_validations IS 'Records all ticket entry validations with full audit trail. Supports QR scanning, manual code entry, and offline device synchronization.';
COMMENT ON COLUMN ticket_validations.validation_method IS 'Method used: qr_scan, manual_code, rfid, nfc, or biometric';
COMMENT ON COLUMN ticket_validations.device_identifier IS 'Unique identifier of the validation device (for traceability)';
COMMENT ON COLUMN ticket_validations.is_offline_sync IS 'True if validation was performed offline and synced later';
COMMENT ON COLUMN ticket_validations.event_date_id IS 'Specific event date when ticket was validated (for multi-day events)';
