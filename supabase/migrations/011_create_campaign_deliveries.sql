-- Migration: Create campaign_deliveries table
-- Description: Tracks email delivery status and basic engagement metrics (opens, clicks)
-- Supports email marketing analytics

CREATE TABLE IF NOT EXISTS campaign_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL,
    delivery_status TEXT NOT NULL DEFAULT 'pending',
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT campaign_deliveries_status_check 
        CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'bounced', 'failed', 'complained')),
    -- Unique constraint to prevent duplicate deliveries for same campaign/profile
    CONSTRAINT campaign_deliveries_unique 
        UNIQUE (campaign_id, profile_id)
);

-- Indexes for common queries
CREATE INDEX idx_campaign_deliveries_campaign_id ON campaign_deliveries(campaign_id);
CREATE INDEX idx_campaign_deliveries_profile_id ON campaign_deliveries(profile_id);
CREATE INDEX idx_campaign_deliveries_status ON campaign_deliveries(delivery_status);
CREATE INDEX idx_campaign_deliveries_opened_at ON campaign_deliveries(opened_at) WHERE opened_at IS NOT NULL;
CREATE INDEX idx_campaign_deliveries_clicked_at ON campaign_deliveries(clicked_at) WHERE clicked_at IS NOT NULL;
CREATE INDEX idx_campaign_deliveries_created_at ON campaign_deliveries(created_at DESC);

-- Enable RLS
ALTER TABLE campaign_deliveries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Producers can view deliveries for their own campaigns
CREATE POLICY "Producers can view own campaign deliveries" 
    ON campaign_deliveries FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_deliveries.campaign_id 
            AND campaigns.producer_id = auth.uid()
        )
    );

-- Users can view their own delivery records
CREATE POLICY "Users can view own delivery records" 
    ON campaign_deliveries FOR SELECT 
    USING (profile_id = auth.uid());

-- Only system/authorized roles can create delivery records
CREATE POLICY "Authorized users can create deliveries" 
    ON campaign_deliveries FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Only system/authorized roles can update delivery status
CREATE POLICY "Authorized users can update deliveries" 
    ON campaign_deliveries FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE campaign_deliveries IS 'Tracks email delivery status and engagement metrics for campaigns. Supports basic email marketing analytics.';
COMMENT ON COLUMN campaign_deliveries.delivery_status IS 'pending, sent, delivered, bounced, failed, or complained';
COMMENT ON COLUMN campaign_deliveries.opened_at IS 'Timestamp when recipient opened the email';
COMMENT ON COLUMN campaign_deliveries.clicked_at IS 'Timestamp when recipient clicked a link';
COMMENT ON CONSTRAINT campaign_deliveries_unique ON campaign_deliveries IS 'Prevents duplicate deliveries for the same campaign and profile';
