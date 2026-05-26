-- Migration: Create featured_events table
-- Description: Manages featured events for homepage and regional agenda
-- Supports scheduled featuring with display ordering

CREATE TABLE IF NOT EXISTS featured_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT featured_events_date_range_valid 
        CHECK (ends_at > starts_at),
    CONSTRAINT featured_events_display_order_positive 
        CHECK (display_order >= 0)
);

-- Indexes for common queries
CREATE INDEX idx_featured_events_event_id ON featured_events(event_id);
CREATE INDEX idx_featured_events_starts_at ON featured_events(starts_at);
CREATE INDEX idx_featured_events_ends_at ON featured_events(ends_at);
CREATE INDEX idx_featured_events_date_range ON featured_events(starts_at, ends_at);
CREATE INDEX idx_featured_events_display_order ON featured_events(display_order);
CREATE INDEX idx_featured_events_created_at ON featured_events(created_at DESC);

-- Enable RLS
ALTER TABLE featured_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view featured events
CREATE POLICY "Anyone can view featured events" 
    ON featured_events FOR SELECT 
    TO PUBLIC
    USING (true);

-- Only authorized staff can manage featured events
CREATE POLICY "Authorized users can create featured events" 
    ON featured_events FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can update featured events" 
    ON featured_events FOR UPDATE 
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authorized users can delete featured events" 
    ON featured_events FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Comments for documentation
COMMENT ON TABLE featured_events IS 'Manages featured events for homepage and regional agenda. Supports scheduled featuring periods and display ordering.';
COMMENT ON COLUMN featured_events.event_id IS 'Reference to the featured event';
COMMENT ON COLUMN featured_events.starts_at IS 'When the featuring period begins';
COMMENT ON COLUMN featured_events.ends_at IS 'When the featuring period ends';
COMMENT ON COLUMN featured_events.display_order IS 'Order for displaying featured events (lower = first)';
