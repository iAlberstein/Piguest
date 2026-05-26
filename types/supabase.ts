/**
 * Tipos generados de la base de datos Supabase.
 * Este archivo debe actualizarse con los tipos reales de la DB usando:
 * npx supabase gen types typescript --project-id <project-id> --schema public > types/supabase.ts
 *
 * NOTA: Este archivo es temporal. Los tipos oficiales se generan automáticamente
 * desde el schema de Supabase.
 */

import type { ID, Nullable, Timestamps } from "./global";

// ============================================================================
// Enums
// ============================================================================

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export type CurrencyCode = "ARS" | "USD";

export type TicketStatus =
  | "active"
  | "used"
  | "cancelled"
  | "expired"
  | "transferred";

// ============================================================================
// Tables
// ============================================================================

export interface TicketOrder extends Timestamps {
  id: ID;
  profile_id: ID;
  event_id: ID;
  order_number: string;
  subtotal_amount: number;
  service_fee_amount: number;
  total_amount: number;
  currency: CurrencyCode;
  payment_status: PaymentStatus;
  promo_code_id: Nullable<ID>;
  expires_at: Nullable<string>;
  paid_at: Nullable<string>;
  cancelled_at: Nullable<string>;
}

export interface Ticket extends Timestamps {
  id: ID;
  order_id: ID;
  event_id: ID;
  ticket_type_id: ID;
  sector_id: Nullable<ID>;
  holder_profile_id: ID;
  qr_code: string;
  manual_code: string;
  ticket_status: TicketStatus;
  is_courtesy: boolean;
  validated_at: Nullable<string>;
}

export interface TicketEventDate {
  id: ID;
  ticket_id: ID;
  event_date_id: ID;
  created_at: string;
}

export interface TicketAdditionalService {
  id: ID;
  ticket_id: ID;
  additional_service_id: ID;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export type ValidationMethod =
  | "qr_scan"
  | "manual_code"
  | "rfid"
  | "nfc"
  | "biometric";

export interface TicketValidation {
  id: ID;
  ticket_id: ID;
  validated_by_profile_id: ID;
  event_date_id: Nullable<ID>;
  validation_method: ValidationMethod;
  validated_at: string;
  device_identifier: Nullable<string>;
  is_offline_sync: boolean;
  created_at: string;
}

export interface CourtesyTicket {
  id: ID;
  ticket_id: ID;
  issued_by_profile_id: ID;
  reason: string;
  created_at: string;
}

export interface Waitlist {
  id: ID;
  event_id: ID;
  profile_id: Nullable<ID>;
  email: string;
  notified_at: Nullable<string>;
  created_at: string;
}

export type SettlementStatus =
  | "pending"
  | "processing"
  | "settled"
  | "failed"
  | "cancelled";

export interface Settlement extends Timestamps {
  id: ID;
  producer_id: ID;
  event_id: ID;
  total_sales_amount: number;
  total_service_fee_amount: number;
  producer_amount: number;
  settlement_status: SettlementStatus;
  settled_at: Nullable<string>;
}

export interface InternalCredit {
  id: ID;
  profile_id: ID;
  amount: number;
  reason: string;
  expires_at: Nullable<string>;
  created_at: string;
}

export interface Campaign extends Timestamps {
  id: ID;
  producer_id: ID;
  name: string;
  subject: string;
  content: string;
  target_filters: Record<string, unknown>;
  scheduled_at: Nullable<string>;
  sent_at: Nullable<string>;
}

export type DeliveryStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "bounced"
  | "failed"
  | "complained";

export interface CampaignDelivery {
  id: ID;
  campaign_id: ID;
  profile_id: ID;
  delivery_status: DeliveryStatus;
  opened_at: Nullable<string>;
  clicked_at: Nullable<string>;
  created_at: string;
}

export interface FeaturedEvent {
  id: ID;
  event_id: ID;
  starts_at: string;
  ends_at: string;
  display_order: number;
  created_at: string;
}

export interface AccessDevice extends Timestamps {
  id: ID;
  producer_id: ID;
  device_name: string;
  device_identifier: string;
  is_active: boolean;
}

export interface AccessLog {
  id: ID;
  device_id: ID;
  event_id: ID;
  action: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface NewsletterPreference extends Timestamps {
  id: ID;
  profile_id: ID;
  interested_categories: string[];
  interested_localities: string[];
  is_subscribed: boolean;
}

// ============================================================================
// Database Interface (para @supabase/ssr)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      ticket_orders: {
        Row: TicketOrder;
        Insert: Omit<TicketOrder, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<TicketOrder, "id" | "created_at" | "updated_at">>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Ticket, "id" | "created_at" | "updated_at">>;
      };
      ticket_event_dates: {
        Row: TicketEventDate;
        Insert: Omit<TicketEventDate, "id" | "created_at">;
        Update: Partial<Omit<TicketEventDate, "id" | "created_at">>;
      };
      ticket_additional_services: {
        Row: TicketAdditionalService;
        Insert: Omit<TicketAdditionalService, "id" | "created_at">;
        Update: Partial<Omit<TicketAdditionalService, "id" | "created_at">>;
      };
      ticket_validations: {
        Row: TicketValidation;
        Insert: Omit<TicketValidation, "id" | "created_at">;
        Update: Partial<Omit<TicketValidation, "id" | "created_at">>;
      };
      courtesy_tickets: {
        Row: CourtesyTicket;
        Insert: Omit<CourtesyTicket, "id" | "created_at">;
        Update: Partial<Omit<CourtesyTicket, "id" | "created_at">>;
      };
      waitlists: {
        Row: Waitlist;
        Insert: Omit<Waitlist, "id" | "created_at">;
        Update: Partial<Omit<Waitlist, "id" | "created_at">>;
      };
      settlements: {
        Row: Settlement;
        Insert: Omit<Settlement, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Settlement, "id" | "created_at" | "updated_at">>;
      };
      internal_credits: {
        Row: InternalCredit;
        Insert: Omit<InternalCredit, "id" | "created_at">;
        Update: Partial<Omit<InternalCredit, "id" | "created_at">>;
      };
      campaigns: {
        Row: Campaign;
        Insert: Omit<Campaign, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Campaign, "id" | "created_at" | "updated_at">>;
      };
      campaign_deliveries: {
        Row: CampaignDelivery;
        Insert: Omit<CampaignDelivery, "id" | "created_at">;
        Update: Partial<Omit<CampaignDelivery, "id" | "created_at">>;
      };
      featured_events: {
        Row: FeaturedEvent;
        Insert: Omit<FeaturedEvent, "id" | "created_at">;
        Update: Partial<Omit<FeaturedEvent, "id" | "created_at">>;
      };
      access_devices: {
        Row: AccessDevice;
        Insert: Omit<AccessDevice, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<AccessDevice, "id" | "created_at" | "updated_at">>;
      };
      access_logs: {
        Row: AccessLog;
        Insert: Omit<AccessLog, "id" | "created_at">;
        Update: Partial<Omit<AccessLog, "id" | "created_at">>;
      };
      newsletter_preferences: {
        Row: NewsletterPreference;
        Insert: Omit<NewsletterPreference, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<NewsletterPreference, "id" | "created_at" | "updated_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
