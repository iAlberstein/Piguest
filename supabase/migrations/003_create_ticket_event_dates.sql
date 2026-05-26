-- Migration: Create ticket_event_dates table
-- Description: Junction table linking tickets to multiple event dates
-- Supports multi-day festivals, workshops with multiple sessions, and date-specific tickets

CREATE TABLE IF NOT EXISTS ticket_event_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    event_date_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint to prevent duplicate date assignments for the same ticket
    CONSTRAINT ticket_event_dates_unique 
        UNIQUE (ticket_id, event_date_id)
);

-- Indexes for common queries
CREATE INDEX idx_ticket_event_dates_ticket_id ON ticket_event_dates(ticket_id);
CREATE INDEX idx_ticket_event_dates_event_date_id ON ticket_event_dates(event_date_id);
CREATE INDEX idx_ticket_event_dates_created_at ON ticket_event_dates(created_at DESC);

-- Enable RLS
ALTER TABLE ticket_event_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view event dates for their own tickets
CREATE POLICY "Users can view own ticket event dates" 
    ON ticket_event_dates FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_event_dates.ticket_id 
            AND (
                tickets.holder_profile_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM ticket_orders 
                    WHERE ticket_orders.id = tickets.order_id 
                    AND ticket_orders.profile_id = auth.uid()
                )
            )
        )
    );

-- Users can create event dates for their own tickets
CREATE POLICY "Users can create event dates for own tickets" 
    ON ticket_event_dates FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_event_dates.ticket_id 
            AND EXISTS (
                SELECT 1 FROM ticket_orders 
                WHERE ticket_orders.id = tickets.order_id 
                AND ticket_orders.profile_id = auth.uid()
            )
        )
    );

-- Users can delete event dates for their own tickets (in case of transfers/partial cancellations)
CREATE POLICY "Users can delete event dates for own tickets" 
    ON ticket_event_dates FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_event_dates.ticket_id 
            AND (
                tickets.holder_profile_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM ticket_orders 
                    WHERE ticket_orders.id = tickets.order_id 
                    AND ticket_orders.profile_id = auth.uid()
                )
            )
        )
    );

-- Comments for documentation
COMMENT ON TABLE ticket_event_dates IS 'Junction table linking tickets to multiple event dates. Supports multi-day festivals, workshops with multiple sessions, and partial date access.';
COMMENT ON COLUMN ticket_event_dates.ticket_id IS 'Reference to the ticket';
COMMENT ON COLUMN ticket_event_dates.event_date_id IS 'Reference to a specific event date/session';
COMMENT ON CONSTRAINT ticket_event_dates_unique ON ticket_event_dates IS 'Prevents assigning the same date multiple times to a ticket';
