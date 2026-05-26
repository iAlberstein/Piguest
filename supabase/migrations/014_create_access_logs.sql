-- Migration: Create access_logs table
-- Description: Audit trail for access device operations, debugging, and offline sync tracking
-- Supports troubleshooting and synchronization monitoring

CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES access_devices(id) ON DELETE CASCADE,
    event_id UUID NOT NULL,
    action TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT access_logs_action_not_empty 
        CHECK (LENGTH(TRIM(action)) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_access_logs_device_id ON access_logs(device_id);
CREATE INDEX idx_access_logs_event_id ON access_logs(event_id);
CREATE INDEX idx_access_logs_action ON access_logs(action);
CREATE INDEX idx_access_logs_created_at ON access_logs(created_at DESC);

-- Enable RLS
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Producers can view logs for their own devices
CREATE POLICY "Producers can view own device logs" 
    ON access_logs FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM access_devices 
            WHERE access_devices.id = access_logs.device_id 
            AND access_devices.producer_id = auth.uid()
        )
    );

-- Only system/authorized roles can create log entries
CREATE POLICY "Authorized users can create logs" 
    ON access_logs FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE access_logs IS 'Audit trail for access device operations. Supports debugging, access auditing, and offline synchronization monitoring.';
COMMENT ON COLUMN access_logs.action IS 'Operation performed (e.g., "ticket_validated", "sync_started", "sync_completed", "offline_mode_entered")';
COMMENT ON COLUMN access_logs.payload IS 'JSON payload with additional context (ticket_id, validation_method, sync_data, errors, etc.)';
COMMENT ON COLUMN access_logs.device_id IS 'Reference to the access device that performed the action';
COMMENT ON COLUMN access_logs.event_id IS 'Reference to the event context for the action';
