-- Migration: Create newsletter_preferences table
-- Description: Stores user preferences for segmented newsletter subscriptions
-- Supports category-based and locality-based newsletter targeting

CREATE TABLE IF NOT EXISTS newsletter_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    interested_categories JSONB DEFAULT '[]',
    interested_localities JSONB DEFAULT '[]',
    is_subscribed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint to prevent duplicate preferences per profile
    CONSTRAINT newsletter_preferences_unique 
        UNIQUE (profile_id)
);

-- Indexes for common queries
CREATE INDEX idx_newsletter_preferences_profile_id ON newsletter_preferences(profile_id);
CREATE INDEX idx_newsletter_preferences_subscribed ON newsletter_preferences(is_subscribed) WHERE is_subscribed = true;
CREATE INDEX idx_newsletter_preferences_categories ON newsletter_preferences USING GIN(interested_categories);
CREATE INDEX idx_newsletter_preferences_localities ON newsletter_preferences USING GIN(interested_localities);
CREATE INDEX idx_newsletter_preferences_created_at ON newsletter_preferences(created_at DESC);

-- Enable RLS
ALTER TABLE newsletter_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own preferences
CREATE POLICY "Users can view own newsletter preferences" 
    ON newsletter_preferences FOR SELECT 
    USING (profile_id = auth.uid());

-- Users can create their own preferences
CREATE POLICY "Users can create own newsletter preferences" 
    ON newsletter_preferences FOR INSERT 
    WITH CHECK (profile_id = auth.uid());

-- Users can update their own preferences
CREATE POLICY "Users can update own newsletter preferences" 
    ON newsletter_preferences FOR UPDATE 
    USING (profile_id = auth.uid());

-- Users can delete their own preferences
CREATE POLICY "Users can delete own newsletter preferences" 
    ON newsletter_preferences FOR DELETE 
    USING (profile_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_preferences_updated_at
    BEFORE UPDATE ON newsletter_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_preferences_updated_at();

-- Comments for documentation
COMMENT ON TABLE newsletter_preferences IS 'Stores user preferences for segmented newsletter subscriptions. Supports category-based and locality-based targeting.';
COMMENT ON COLUMN newsletter_preferences.interested_categories IS 'JSON array of category IDs the user is interested in (e.g., ["music", "sports", "theater"])';
COMMENT ON COLUMN newsletter_preferences.interested_localities IS 'JSON array of locality IDs the user is interested in (e.g., ["caba", "la-plata", "rosario"])';
COMMENT ON COLUMN newsletter_preferences.is_subscribed IS 'Whether the user is currently subscribed to newsletters';
