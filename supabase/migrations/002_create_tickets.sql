-- Migration: Create tickets table
-- Description: Individual tickets associated with orders, supporting QR and manual codes

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES ticket_orders(id) ON DELETE CASCADE,
    event_id UUID NOT NULL,
    ticket_type_id UUID NOT NULL,
    sector_id UUID,
    holder_profile_id UUID NOT NULL,
    qr_code TEXT NOT NULL UNIQUE,
    manual_code TEXT NOT NULL UNIQUE,
    ticket_status TEXT NOT NULL DEFAULT 'active',
    is_courtesy BOOLEAN NOT NULL DEFAULT false,
    validated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT tickets_ticket_status_check 
        CHECK (ticket_status IN ('active', 'used', 'cancelled', 'expired', 'transferred'))
);

-- Indexes for common queries
CREATE INDEX idx_tickets_order_id ON tickets(order_id);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_ticket_type_id ON tickets(ticket_type_id);
CREATE INDEX idx_tickets_sector_id ON tickets(sector_id) WHERE sector_id IS NOT NULL;
CREATE INDEX idx_tickets_holder_profile_id ON tickets(holder_profile_id);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_manual_code ON tickets(manual_code);
CREATE INDEX idx_tickets_ticket_status ON tickets(ticket_status);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);

-- Enable RLS
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view tickets they own (via order) or hold
CREATE POLICY "Users can view own tickets" 
    ON tickets FOR SELECT 
    USING (
        holder_profile_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM ticket_orders 
            WHERE ticket_orders.id = tickets.order_id 
            AND ticket_orders.profile_id = auth.uid()
        )
    );

-- Users can create tickets for their own orders
CREATE POLICY "Users can create tickets for own orders" 
    ON tickets FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ticket_orders 
            WHERE ticket_orders.id = tickets.order_id 
            AND ticket_orders.profile_id = auth.uid()
        )
    );

-- Users can update their own active tickets (for transfers)
CREATE POLICY "Users can update own active tickets" 
    ON tickets FOR UPDATE 
    USING (
        holder_profile_id = auth.uid() 
        AND ticket_status = 'active'
    );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_tickets_updated_at();

-- Comments for documentation
COMMENT ON TABLE tickets IS 'Individual tickets associated with orders. Supports QR codes, manual codes, and courtesy tickets.';
COMMENT ON COLUMN tickets.qr_code IS 'Unique QR code for ticket validation';
COMMENT ON COLUMN tickets.manual_code IS 'Unique manual code for backup validation (alphanumeric)';
COMMENT ON COLUMN tickets.holder_profile_id IS 'Current ticket holder (al portador), may differ from buyer';
COMMENT ON COLUMN tickets.ticket_status IS 'active, used, cancelled, expired, or transferred';
COMMENT ON COLUMN tickets.is_courtesy IS 'True if ticket is a courtesy/guest ticket';
