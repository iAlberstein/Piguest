-- Migration: Create ticket_orders table
-- Description: Orders table for ticket purchases, supports free and paid orders with expiration

CREATE TABLE IF NOT EXISTS ticket_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    event_id UUID NOT NULL,
    order_number TEXT NOT NULL UNIQUE,
    subtotal_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    service_fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'ARS',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    promo_code_id UUID,
    expires_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT ticket_orders_payment_status_check 
        CHECK (payment_status IN ('pending', 'paid', 'failed', 'cancelled', 'expired', 'refunded')),
    CONSTRAINT ticket_orders_currency_check 
        CHECK (currency IN ('ARS', 'USD')),
    CONSTRAINT ticket_orders_amounts_positive 
        CHECK (subtotal_amount >= 0 AND service_fee_amount >= 0 AND total_amount >= 0),
    CONSTRAINT ticket_orders_total_matches 
        CHECK (total_amount = subtotal_amount + service_fee_amount)
);

-- Indexes for common queries
CREATE INDEX idx_ticket_orders_profile_id ON ticket_orders(profile_id);
CREATE INDEX idx_ticket_orders_event_id ON ticket_orders(event_id);
CREATE INDEX idx_ticket_orders_order_number ON ticket_orders(order_number);
CREATE INDEX idx_ticket_orders_payment_status ON ticket_orders(payment_status);
CREATE INDEX idx_ticket_orders_created_at ON ticket_orders(created_at DESC);
CREATE INDEX idx_ticket_orders_expires ON ticket_orders(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE ticket_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own orders
CREATE POLICY "Users can view own orders" 
    ON ticket_orders FOR SELECT 
    USING (profile_id = auth.uid());

-- Users can create their own orders
CREATE POLICY "Users can create own orders" 
    ON ticket_orders FOR INSERT 
    WITH CHECK (profile_id = auth.uid());

-- Users can update their own pending orders (for cancellation)
CREATE POLICY "Users can update own pending orders" 
    ON ticket_orders FOR UPDATE 
    USING (profile_id = auth.uid() AND payment_status = 'pending');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_orders_updated_at
    BEFORE UPDATE ON ticket_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_ticket_orders_updated_at();

-- Comment for documentation
COMMENT ON TABLE ticket_orders IS 'Stores ticket purchase orders with support for free orders and checkout expiration';
COMMENT ON COLUMN ticket_orders.order_number IS 'Unique human-readable order identifier (e.g., ORD-2026-000001)';
COMMENT ON COLUMN ticket_orders.payment_status IS 'pending, paid, failed, cancelled, expired, or refunded';
COMMENT ON COLUMN ticket_orders.expires_at IS 'Order expiration time for checkout timeout (e.g., 15 minutes)';
