-- Migration: Create internal_credits table
-- Description: Manages internal credits for benefits, promotional credits, and compensations
-- Supports expiring credits with full audit trail

CREATE TABLE IF NOT EXISTS internal_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT internal_credits_amount_positive 
        CHECK (amount > 0),
    CONSTRAINT internal_credits_reason_not_empty 
        CHECK (LENGTH(TRIM(reason)) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_internal_credits_profile_id ON internal_credits(profile_id);
CREATE INDEX idx_internal_credits_expires_at ON internal_credits(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_internal_credits_created_at ON internal_credits(created_at DESC);

-- Enable RLS
ALTER TABLE internal_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own credits
CREATE POLICY "Users can view own credits" 
    ON internal_credits FOR SELECT 
    USING (profile_id = auth.uid());

-- Only authorized staff can create credits
CREATE POLICY "Authorized users can create credits" 
    ON internal_credits FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only authorized staff can update credits
CREATE POLICY "Authorized users can update credits" 
    ON internal_credits FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE internal_credits IS 'Manages internal credits for benefits, promotional credits, and compensations. Credits can have expiration dates.';
COMMENT ON COLUMN internal_credits.amount IS 'Credit amount in ARS';
COMMENT ON COLUMN internal_credits.reason IS 'Reason for the credit (e.g., "Promotional benefit", "Event compensation", "Loyalty reward")';
COMMENT ON COLUMN internal_credits.expires_at IS 'Optional expiration date for the credit';
