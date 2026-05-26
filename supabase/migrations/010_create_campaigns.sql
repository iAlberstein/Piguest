-- Migration: Create campaigns table
-- Description: Manages email campaigns, newsletters, and segmented campaigns
-- Supports scheduled campaigns and future automations

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producer_id UUID NOT NULL,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    target_filters JSONB DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT campaigns_name_not_empty 
        CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT campaigns_subject_not_empty 
        CHECK (LENGTH(TRIM(subject)) > 0),
    CONSTRAINT campaigns_content_not_empty 
        CHECK (LENGTH(TRIM(content)) > 0)
);

-- Indexes for common queries
CREATE INDEX idx_campaigns_producer_id ON campaigns(producer_id);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_campaigns_sent_at ON campaigns(sent_at) WHERE sent_at IS NOT NULL;
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Enable RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Producers can view their own campaigns
CREATE POLICY "Producers can view own campaigns" 
    ON campaigns FOR SELECT 
    USING (producer_id = auth.uid());

-- Producers can create their own campaigns
CREATE POLICY "Producers can create own campaigns" 
    ON campaigns FOR INSERT 
    WITH CHECK (producer_id = auth.uid());

-- Producers can update their own campaigns
CREATE POLICY "Producers can update own campaigns" 
    ON campaigns FOR UPDATE 
    USING (producer_id = auth.uid());

-- Producers can delete their own campaigns
CREATE POLICY "Producers can delete own campaigns" 
    ON campaigns FOR DELETE 
    USING (producer_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_campaigns_updated_at();

-- Comments for documentation
COMMENT ON TABLE campaigns IS 'Manages email campaigns, newsletters, and segmented marketing campaigns. Supports scheduling and future automations.';
COMMENT ON COLUMN campaigns.target_filters IS 'JSON filters for audience segmentation (e.g., event attendees, location, etc.)';
COMMENT ON COLUMN campaigns.scheduled_at IS 'When the campaign should be sent (null for drafts)';
COMMENT ON COLUMN campaigns.sent_at IS 'Timestamp when campaign was actually sent';
