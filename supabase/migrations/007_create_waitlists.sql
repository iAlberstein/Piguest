-- Migration: Create waitlists table
-- Description: Manages waitlists for sold-out events with notification tracking
-- Supports automatic notifications when tickets become available

CREATE TABLE IF NOT EXISTS waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    profile_id UUID,
    email TEXT NOT NULL,
    notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT waitlists_email_not_empty 
        CHECK (LENGTH(TRIM(email)) > 0),
    -- Unique constraint to prevent duplicate waitlist entries for same event/email
    CONSTRAINT waitlists_unique 
        UNIQUE (event_id, email)
);

-- Indexes for common queries
CREATE INDEX idx_waitlists_event_id ON waitlists(event_id);
CREATE INDEX idx_waitlists_profile_id ON waitlists(profile_id) WHERE profile_id IS NOT NULL;
CREATE INDEX idx_waitlists_email ON waitlists(email);
CREATE INDEX idx_waitlists_notified_at ON waitlists(notified_at) WHERE notified_at IS NULL;
CREATE INDEX idx_waitlists_created_at ON waitlists(created_at DESC);

-- Enable RLS
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist entries" 
    ON waitlists FOR SELECT 
    USING (
        profile_id = auth.uid() 
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Users can create their own waitlist entries
CREATE POLICY "Users can create own waitlist entries" 
    ON waitlists FOR INSERT 
    WITH CHECK (
        profile_id = auth.uid()
        OR profile_id IS NULL
    );

-- Users can delete their own waitlist entries
CREATE POLICY "Users can delete own waitlist entries" 
    ON waitlists FOR DELETE 
    USING (
        profile_id = auth.uid()
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Comments for documentation
COMMENT ON TABLE waitlists IS 'Manages waitlists for sold-out events. Tracks when users requested tickets and when they were notified of availability.';
COMMENT ON COLUMN waitlists.profile_id IS 'Optional reference to registered user (null for guest waitlist entries)';
COMMENT ON COLUMN waitlists.email IS 'Email address for notification (required)';
COMMENT ON COLUMN waitlists.notified_at IS 'Timestamp when user was notified that tickets became available';
COMMENT ON CONSTRAINT waitlists_unique ON waitlists IS 'Prevents duplicate waitlist entries for the same event and email';
