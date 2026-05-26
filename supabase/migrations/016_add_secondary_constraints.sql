-- Migration: Add secondary constraints for data integrity
-- Description: Additional constraints for existing tables only
-- Applied exclusively to: ticket_orders, tickets, ticket_event_dates, ticket_additional_services,
--   ticket_validations, courtesy_tickets, waitlists, settlements, internal_credits,
--   campaigns, campaign_deliveries, featured_events, access_devices, access_logs, newsletter_preferences

-- ============================================================================
-- TICKET ORDERS TABLE - Additional date coherence constraints
-- ============================================================================

-- Ensure paid_at is not before created_at
ALTER TABLE ticket_orders 
    ADD CONSTRAINT ticket_orders_paid_after_creation 
    CHECK (paid_at IS NULL OR paid_at >= created_at);

-- Ensure cancelled_at is not before created_at
ALTER TABLE ticket_orders 
    ADD CONSTRAINT ticket_orders_cancelled_after_creation 
    CHECK (cancelled_at IS NULL OR cancelled_at >= created_at);

-- Ensure expires_at is after created_at
ALTER TABLE ticket_orders 
    ADD CONSTRAINT ticket_orders_expires_after_creation 
    CHECK (expires_at IS NULL OR expires_at > created_at);

-- ============================================================================
-- TICKETS TABLE - Additional constraints
-- ============================================================================

-- Ensure validated_at is not before created_at
ALTER TABLE tickets 
    ADD CONSTRAINT tickets_validated_after_creation 
    CHECK (validated_at IS NULL OR validated_at >= created_at);

-- ============================================================================
-- TICKET VALIDATIONS TABLE - Additional constraints
-- ============================================================================

-- Ensure validated_at is not in the future
ALTER TABLE ticket_validations 
    ADD CONSTRAINT ticket_validations_not_future 
    CHECK (validated_at <= NOW());

-- ============================================================================
-- COURTESY TICKETS TABLE - Additional constraints
-- ============================================================================

-- Ensure created_at is not in the future
ALTER TABLE courtesy_tickets 
    ADD CONSTRAINT courtesy_tickets_not_future 
    CHECK (created_at <= NOW());

-- ============================================================================
-- WAITLISTS TABLE - Additional constraints
-- ============================================================================

-- Ensure notified_at is not before created_at
ALTER TABLE waitlists 
    ADD CONSTRAINT waitlists_notified_after_creation 
    CHECK (notified_at IS NULL OR notified_at >= created_at);

-- ============================================================================
-- SETTLEMENTS TABLE - Additional constraints
-- ============================================================================

-- Ensure settled_at is not before created_at
ALTER TABLE settlements 
    ADD CONSTRAINT settlements_settled_after_creation 
    CHECK (settled_at IS NULL OR settled_at >= created_at);

-- ============================================================================
-- INTERNAL CREDITS TABLE - Additional constraints
-- ============================================================================

-- Ensure expires_at is after created_at if set
ALTER TABLE internal_credits 
    ADD CONSTRAINT internal_credits_expires_after_creation 
    CHECK (expires_at IS NULL OR expires_at > created_at);

-- ============================================================================
-- CAMPAIGNS TABLE - Additional constraints
-- ============================================================================

-- Ensure scheduled_at is not before created_at
ALTER TABLE campaigns 
    ADD CONSTRAINT campaigns_scheduled_after_creation 
    CHECK (scheduled_at IS NULL OR scheduled_at >= created_at);

-- Ensure sent_at is not before scheduled_at if both set
ALTER TABLE campaigns 
    ADD CONSTRAINT campaigns_sent_after_scheduled 
    CHECK (sent_at IS NULL OR scheduled_at IS NULL OR sent_at >= scheduled_at);

-- Ensure sent_at is not before created_at
ALTER TABLE campaigns 
    ADD CONSTRAINT campaigns_sent_after_creation 
    CHECK (sent_at IS NULL OR sent_at >= created_at);

-- ============================================================================
-- CAMPAIGN DELIVERIES TABLE - Additional constraints
-- ============================================================================

-- Ensure opened_at is not before created_at
ALTER TABLE campaign_deliveries 
    ADD CONSTRAINT campaign_deliveries_opened_after_creation 
    CHECK (opened_at IS NULL OR opened_at >= created_at);

-- Ensure clicked_at is not before opened_at
ALTER TABLE campaign_deliveries 
    ADD CONSTRAINT campaign_deliveries_clicked_after_opened 
    CHECK (clicked_at IS NULL OR opened_at IS NULL OR clicked_at >= opened_at);

-- Ensure clicked_at is not before created_at
ALTER TABLE campaign_deliveries 
    ADD CONSTRAINT campaign_deliveries_clicked_after_creation 
    CHECK (clicked_at IS NULL OR clicked_at >= created_at);

-- ============================================================================
-- FEATURED EVENTS TABLE - Additional constraints
-- ============================================================================

-- Ensure ends_at is after starts_at
ALTER TABLE featured_events 
    ADD CONSTRAINT featured_events_ends_after_starts 
    CHECK (ends_at > starts_at);

-- Ensure starts_at is not before created_at
ALTER TABLE featured_events 
    ADD CONSTRAINT featured_events_starts_after_creation 
    CHECK (starts_at >= created_at);

-- ============================================================================
-- ACCESS DEVICES TABLE - Additional constraints
-- ============================================================================

-- Ensure created_at is not in the future
ALTER TABLE access_devices 
    ADD CONSTRAINT access_devices_not_future 
    CHECK (created_at <= NOW());

-- ============================================================================
-- ACCESS LOGS TABLE - Additional constraints
-- ============================================================================

-- Ensure created_at is not in the future
ALTER TABLE access_logs 
    ADD CONSTRAINT access_logs_not_future 
    CHECK (created_at <= NOW());

-- ============================================================================
-- NEWSLETTER PREFERENCES TABLE - Additional constraints
-- ============================================================================

-- Ensure created_at is not in the future
ALTER TABLE newsletter_preferences 
    ADD CONSTRAINT newsletter_preferences_not_future 
    CHECK (created_at <= NOW());

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON CONSTRAINT ticket_orders_paid_after_creation ON ticket_orders IS 'Ensures payment timestamp is not before order creation';
COMMENT ON CONSTRAINT ticket_orders_expires_after_creation ON ticket_orders IS 'Ensures order expiration is after creation';
COMMENT ON CONSTRAINT tickets_validated_after_creation ON tickets IS 'Ensures validation timestamp is not before ticket creation';
COMMENT ON CONSTRAINT ticket_validations_not_future ON ticket_validations IS 'Ensures validation timestamp is not in the future';
COMMENT ON CONSTRAINT settlements_settled_after_creation ON settlements IS 'Ensures settlement date is not before creation';
COMMENT ON CONSTRAINT internal_credits_expires_after_creation ON internal_credits IS 'Ensures credit expiration is after creation';
COMMENT ON CONSTRAINT featured_events_ends_after_starts ON featured_events IS 'Ensures featuring end is after start';
