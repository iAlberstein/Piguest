-- Migration: Create settlements table
-- Description: Manages producer settlements with "por cuenta y orden de terceros" model
-- Supports post-event settlements and financial tracking

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL,
    event_id UUID NOT NULL,
    total_sales_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_service_fee_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    producer_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    settlement_status TEXT NOT NULL DEFAULT 'pending',
    settled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT settlements_status_check 
        CHECK (settlement_status IN ('pending', 'processing', 'settled', 'failed', 'cancelled')),
    CONSTRAINT settlements_amounts_positive 
        CHECK (total_sales_amount >= 0 AND total_service_fee_amount >= 0 AND producer_amount >= 0),
    CONSTRAINT settlements_producer_amount_correct 
        CHECK (producer_amount = total_sales_amount - total_service_fee_amount)
);

-- Indexes for common queries
CREATE INDEX idx_settlements_producer_id ON settlements(producer_id);
CREATE INDEX idx_settlements_event_id ON settlements(event_id);
CREATE INDEX idx_settlements_status ON settlements(settlement_status);
CREATE INDEX idx_settlements_settled_at ON settlements(settled_at) WHERE settled_at IS NOT NULL;
CREATE INDEX idx_settlements_created_at ON settlements(created_at DESC);

-- Enable RLS
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Producers can view their own settlements
CREATE POLICY "Producers can view own settlements" 
    ON settlements FOR SELECT 
    USING (producer_id = auth.uid());

-- Only system/authorized roles can create settlements
CREATE POLICY "Authorized users can create settlements" 
    ON settlements FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only authorized roles can update settlements
CREATE POLICY "Authorized users can update settlements" 
    ON settlements FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settlements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settlements_updated_at
    BEFORE UPDATE ON settlements
    FOR EACH ROW
    EXECUTE FUNCTION update_settlements_updated_at();

-- Comments for documentation
COMMENT ON TABLE settlements IS 'Manages producer settlements with "por cuenta y orden de terceros" model. Tracks sales, fees, and producer payments.';
COMMENT ON COLUMN settlements.total_sales_amount IS 'Total ticket sales amount for the event';
COMMENT ON COLUMN settlements.total_service_fee_amount IS 'Total platform service fees deducted';
COMMENT ON COLUMN settlements.producer_amount IS 'Amount to be paid to producer (total_sales - service_fees)';
COMMENT ON COLUMN settlements.settlement_status IS 'pending, processing, settled, failed, or cancelled';
COMMENT ON COLUMN settlements.settled_at IS 'Timestamp when settlement was completed';
