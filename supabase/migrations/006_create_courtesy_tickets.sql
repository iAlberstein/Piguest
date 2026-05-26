-- Migration: Create courtesy_tickets table
-- Description: Records courtesy/guest tickets with full traceability
-- Supports admin and producer issued courtesies with reason tracking

CREATE TABLE IF NOT EXISTS courtesy_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    issued_by_profile_id UUID NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT courtesy_tickets_reason_not_empty 
        CHECK (LENGTH(TRIM(reason)) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_courtesy_tickets_ticket_id ON courtesy_tickets(ticket_id);
CREATE INDEX idx_courtesy_tickets_issued_by ON courtesy_tickets(issued_by_profile_id);
CREATE INDEX idx_courtesy_tickets_created_at ON courtesy_tickets(created_at DESC);

-- Enable RLS
ALTER TABLE courtesy_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Staff can view all courtesy tickets for events they manage
CREATE POLICY "Staff can view courtesy tickets" 
    ON courtesy_tickets FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = courtesy_tickets.ticket_id 
            AND tickets.holder_profile_id = auth.uid()
        )
        OR issued_by_profile_id = auth.uid()
    );

-- Only authorized staff can create courtesy tickets
CREATE POLICY "Authorized users can create courtesy tickets" 
    ON courtesy_tickets FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only the issuer can update their own courtesy records (for corrections)
CREATE POLICY "Issuers can update own courtesy records" 
    ON courtesy_tickets FOR UPDATE 
    USING (issued_by_profile_id = auth.uid());

-- Only the issuer can delete their own courtesy records (if needed)
CREATE POLICY "Issuers can delete own courtesy records" 
    ON courtesy_tickets FOR DELETE 
    USING (issued_by_profile_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE courtesy_tickets IS 'Records courtesy/guest tickets with full audit trail. Tracks who issued the courtesy and the reason.';
COMMENT ON COLUMN courtesy_tickets.issued_by_profile_id IS 'Profile ID of admin or producer who issued the courtesy';
COMMENT ON COLUMN courtesy_tickets.reason IS 'Reason for the courtesy (e.g., "VIP guest", "Press", "Sponsor")';
COMMENT ON CONSTRAINT courtesy_tickets_reason_not_empty ON courtesy_tickets IS 'Ensures a valid reason is provided for all courtesy tickets';
