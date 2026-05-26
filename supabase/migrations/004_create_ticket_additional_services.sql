-- Migration: Create ticket_additional_services table
-- Description: Junction table linking tickets to additional services with quantity and pricing
-- Supports multiple services per ticket with individual pricing

CREATE TABLE IF NOT EXISTS ticket_additional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    additional_service_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ticket_additional_services_quantity_positive 
        CHECK (quantity > 0),
    CONSTRAINT ticket_additional_services_unit_price_positive 
        CHECK (unit_price >= 0),
    CONSTRAINT ticket_additional_services_total_price_matches 
        CHECK (total_price = unit_price * quantity),
    -- Unique constraint to prevent duplicate service assignments for the same ticket
    CONSTRAINT ticket_additional_services_unique 
        UNIQUE (ticket_id, additional_service_id)
);

-- Indexes for common queries
CREATE INDEX idx_ticket_additional_services_ticket_id ON ticket_additional_services(ticket_id);
CREATE INDEX idx_ticket_additional_services_service_id ON ticket_additional_services(additional_service_id);
CREATE INDEX idx_ticket_additional_services_created_at ON ticket_additional_services(created_at DESC);

-- Enable RLS
ALTER TABLE ticket_additional_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view additional services for their own tickets
CREATE POLICY "Users can view own ticket additional services" 
    ON ticket_additional_services FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_additional_services.ticket_id 
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

-- Users can create additional services for their own tickets
CREATE POLICY "Users can create additional services for own tickets" 
    ON ticket_additional_services FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_additional_services.ticket_id 
            AND EXISTS (
                SELECT 1 FROM ticket_orders 
                WHERE ticket_orders.id = tickets.order_id 
                AND ticket_orders.profile_id = auth.uid()
            )
        )
    );

-- Users can update additional services for their own tickets
CREATE POLICY "Users can update additional services for own tickets" 
    ON ticket_additional_services FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_additional_services.ticket_id 
            AND EXISTS (
                SELECT 1 FROM ticket_orders 
                WHERE ticket_orders.id = tickets.order_id 
                AND ticket_orders.profile_id = auth.uid()
            )
        )
    );

-- Users can delete additional services for their own tickets
CREATE POLICY "Users can delete additional services for own tickets" 
    ON ticket_additional_services FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM tickets 
            WHERE tickets.id = ticket_additional_services.ticket_id 
            AND EXISTS (
                SELECT 1 FROM ticket_orders 
                WHERE ticket_orders.id = tickets.order_id 
                AND ticket_orders.profile_id = auth.uid()
            )
        )
    );

-- Comments for documentation
COMMENT ON TABLE ticket_additional_services IS 'Junction table linking tickets to additional services. Supports multiple services per ticket with individual quantity and pricing.';
COMMENT ON COLUMN ticket_additional_services.quantity IS 'Number of units of this service for the ticket';
COMMENT ON COLUMN ticket_additional_services.unit_price IS 'Price per unit at the time of purchase';
COMMENT ON COLUMN ticket_additional_services.total_price IS 'Total price for this service (quantity * unit_price)';
COMMENT ON CONSTRAINT ticket_additional_services_unique ON ticket_additional_services IS 'Prevents assigning the same service multiple times to a ticket; use quantity for multiples';
