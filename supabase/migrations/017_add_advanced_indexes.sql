-- Migration: Add advanced performance indexes
-- Description: Optimizes queries for event searches, QR validation, dashboards, waitlists, campaigns, and analytics

-- ============================================================================
-- TICKET ORDERS - Additional indexes for dashboards and analytics
-- ============================================================================

-- Composite index for event sales analytics
CREATE INDEX idx_ticket_orders_event_payment_status ON ticket_orders(event_id, payment_status);

-- Index for producer dashboard (orders by profile and status)
CREATE INDEX idx_ticket_orders_profile_payment ON ticket_orders(profile_id, payment_status, created_at DESC);

-- Index for expired orders cleanup/query
CREATE INDEX idx_ticket_orders_expired ON ticket_orders(expires_at) WHERE expires_at IS NOT NULL AND payment_status = 'pending';

-- ============================================================================
-- TICKETS - Additional indexes for QR validation and dashboards
-- ============================================================================

-- Composite index for QR validation with status
CREATE INDEX idx_tickets_qr_status ON tickets(qr_code, ticket_status);

-- Composite index for manual code validation
CREATE INDEX idx_tickets_manual_status ON tickets(manual_code, ticket_status);

-- Index for event entry management (active tickets by event)
CREATE INDEX idx_tickets_event_active ON tickets(event_id, ticket_status) WHERE ticket_status = 'active';

-- Index for ticket holder lookups
CREATE INDEX idx_tickets_holder_event ON tickets(holder_profile_id, event_id);

-- Index for courtesy tickets lookup
CREATE INDEX idx_tickets_courtesy ON tickets(is_courtesy, ticket_status) WHERE is_courtesy = true;

-- ============================================================================
-- TICKET VALIDATIONS - Additional indexes for analytics
-- ============================================================================

-- Composite index for validation analytics by event date
CREATE INDEX idx_ticket_validations_event_date_method ON ticket_validations(event_date_id, validation_method);

-- Index for validation counts by ticket
CREATE INDEX idx_ticket_validations_ticket_count ON ticket_validations(ticket_id, validated_at DESC);

-- ============================================================================
-- WAITLISTS - Additional indexes for event management
-- ============================================================================

-- Composite index for waitlist analytics
CREATE INDEX idx_waitlists_event_notified ON waitlists(event_id, notified_at) WHERE notified_at IS NOT NULL;

-- Index for pending notifications
CREATE INDEX idx_waitlists_pending_notify ON waitlists(event_id, email) WHERE notified_at IS NULL;

-- ============================================================================
-- SETTLEMENTS - Additional indexes for financial dashboards
-- ============================================================================

-- Composite index for producer financial dashboard
CREATE INDEX idx_settlements_producer_status ON settlements(producer_id, settlement_status, settled_at DESC);

-- Index for pending settlements
CREATE INDEX idx_settlements_pending ON settlements(settlement_status) WHERE settlement_status IN ('pending', 'processing');

-- Index for settlements by event
CREATE INDEX idx_settlements_event ON settlements(event_id, settlement_status);

-- ============================================================================
-- CAMPAIGNS - Additional indexes for campaign management
-- ============================================================================

-- Composite index for scheduled campaigns (for cron jobs)
CREATE INDEX idx_campaigns_scheduled_pending ON campaigns(scheduled_at, sent_at) WHERE scheduled_at IS NOT NULL AND sent_at IS NULL;

-- Index for sent campaigns analytics
CREATE INDEX idx_campaigns_sent_analytics ON campaigns(producer_id, sent_at DESC) WHERE sent_at IS NOT NULL;

-- Index for draft campaigns
CREATE INDEX idx_campaigns_drafts ON campaigns(producer_id, created_at DESC) WHERE scheduled_at IS NULL AND sent_at IS NULL;

-- ============================================================================
-- CAMPAIGN DELIVERIES - Additional indexes for email analytics
-- ============================================================================

-- Composite index for delivery analytics by campaign
CREATE INDEX idx_campaign_deliveries_stats ON campaign_deliveries(campaign_id, delivery_status);

-- Index for engagement analytics (opened emails)
CREATE INDEX idx_campaign_deliveries_engagement ON campaign_deliveries(campaign_id, opened_at) WHERE opened_at IS NOT NULL;

-- Index for click analytics
CREATE INDEX idx_campaign_deliveries_clicks ON campaign_deliveries(campaign_id, clicked_at) WHERE clicked_at IS NOT NULL;

-- Index for failed deliveries
CREATE INDEX idx_campaign_deliveries_failed ON campaign_deliveries(campaign_id, delivery_status) WHERE delivery_status IN ('bounced', 'failed', 'complained');

-- ============================================================================
-- INTERNAL CREDITS - Additional indexes
-- ============================================================================

-- Index for credits by profile (query active credits in application logic)
CREATE INDEX idx_internal_credits_profile_expires ON internal_credits(profile_id, expires_at);

-- ============================================================================
-- ACCESS LOGS - Additional indexes for debugging
-- ============================================================================

-- Composite index for device event logs
CREATE INDEX idx_access_logs_device_event ON access_logs(device_id, event_id, created_at DESC);

-- Index for action-specific queries with timestamp
CREATE INDEX idx_access_logs_action_time ON access_logs(action, created_at DESC);

-- ============================================================================
-- NEWSLETTER PREFERENCES - Additional indexes
-- ============================================================================

-- Note: idx_newsletter_preferences_subscribed already exists in migration 015
-- Additional indexes would go here when needed

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON INDEX idx_ticket_orders_event_payment_status IS 'Optimizes event sales analytics queries';
COMMENT ON INDEX idx_tickets_qr_status IS 'Optimizes QR code validation lookups with status check';
COMMENT ON INDEX idx_tickets_event_active IS 'Optimizes event entry management for active tickets only';
COMMENT ON INDEX idx_waitlists_pending_notify IS 'Optimizes pending notification queries for waitlists';
COMMENT ON INDEX idx_settlements_pending IS 'Optimizes pending settlements dashboard queries';
COMMENT ON INDEX idx_campaigns_scheduled_pending IS 'Optimizes scheduled campaign processing (cron jobs)';
COMMENT ON INDEX idx_campaign_deliveries_engagement IS 'Optimizes email open rate analytics';
COMMENT ON INDEX idx_internal_credits_profile_expires IS 'Optimizes credit lookups by profile with expiration date';
COMMENT ON INDEX idx_access_logs_device_event IS 'Optimizes device-specific event log queries for debugging';
COMMENT ON INDEX idx_access_logs_action_time IS 'Optimizes action-specific log queries with timestamp sorting';
