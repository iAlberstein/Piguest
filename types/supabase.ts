export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      access_devices: {
        Row: {
          created_at: string
          device_identifier: string
          device_name: string
          id: string
          is_active: boolean
          producer_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_identifier: string
          device_name: string
          id?: string
          is_active?: boolean
          producer_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_identifier?: string
          device_name?: string
          id?: string
          is_active?: boolean
          producer_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      access_logs: {
        Row: {
          action: string
          created_at: string
          device_id: string
          event_id: string
          id: string
          payload: Json | null
        }
        Insert: {
          action: string
          created_at?: string
          device_id: string
          event_id: string
          id?: string
          payload?: Json | null
        }
        Update: {
          action?: string
          created_at?: string
          device_id?: string
          event_id?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "access_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          actor_role: string | null
          created_at: string
          event_description: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: unknown
          payload: Json | null
          request_path: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_description?: string | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown
          payload?: Json | null
          request_path?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          event_description?: string | null
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown
          payload?: Json | null
          request_path?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      campaign_deliveries: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          delivery_status: string
          id: string
          opened_at: string | null
          profile_id: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          id?: string
          opened_at?: string | null
          profile_id: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          id?: string
          opened_at?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          producer_id: string
          scheduled_at: string | null
          sent_at: string | null
          subject: string
          target_filters: Json | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          producer_id: string
          scheduled_at?: string | null
          sent_at?: string | null
          subject: string
          target_filters?: Json | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          producer_id?: string
          scheduled_at?: string | null
          sent_at?: string | null
          subject?: string
          target_filters?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      courtesy_tickets: {
        Row: {
          created_at: string
          id: string
          issued_by_profile_id: string
          reason: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issued_by_profile_id: string
          reason: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issued_by_profile_id?: string
          reason?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courtesy_tickets_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_events: {
        Row: {
          created_at: string
          display_order: number
          ends_at: string
          event_id: string
          id: string
          starts_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          ends_at: string
          event_id: string
          id?: string
          starts_at: string
        }
        Update: {
          created_at?: string
          display_order?: number
          ends_at?: string
          event_id?: string
          id?: string
          starts_at?: string
        }
        Relationships: []
      }
      internal_credits: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          profile_id: string
          reason: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          profile_id: string
          reason: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          profile_id?: string
          reason?: string
        }
        Relationships: []
      }
      newsletter_preferences: {
        Row: {
          created_at: string
          id: string
          interested_categories: Json | null
          interested_localities: Json | null
          is_subscribed: boolean
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          interested_categories?: Json | null
          interested_localities?: Json | null
          is_subscribed?: boolean
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          interested_categories?: Json | null
          interested_localities?: Json | null
          is_subscribed?: boolean
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      producers: {
        Row: {
          address: string | null
          auth_user_id: string
          business_name: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          legal_name: string | null
          phone: string | null
          profile_id: string
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          auth_user_id: string
          business_name: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          phone?: string | null
          profile_id: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          auth_user_id?: string
          business_name?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          legal_name?: string | null
          phone?: string | null
          profile_id?: string
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          auth_user_id: string
          birth_date: string | null
          created_at: string
          dni: string | null
          email: string
          full_name: string | null
          gender: string | null
          id: string
          is_blocked: boolean
          locality: string | null
          phone: string | null
          province: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          birth_date?: string | null
          created_at?: string
          dni?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          id?: string
          is_blocked?: boolean
          locality?: string | null
          phone?: string | null
          province?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          birth_date?: string | null
          created_at?: string
          dni?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          id?: string
          is_blocked?: boolean
          locality?: string | null
          phone?: string | null
          province?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          created_at: string
          event_id: string
          id: string
          producer_amount: number
          producer_id: string
          settled_at: string | null
          settlement_status: string
          total_sales_amount: number
          total_service_fee_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          producer_amount?: number
          producer_id: string
          settled_at?: string | null
          settlement_status?: string
          total_sales_amount?: number
          total_service_fee_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          producer_amount?: number
          producer_id?: string
          settled_at?: string | null
          settlement_status?: string
          total_sales_amount?: number
          total_service_fee_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_additional_services: {
        Row: {
          additional_service_id: string
          created_at: string
          id: string
          quantity: number
          ticket_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          additional_service_id: string
          created_at?: string
          id?: string
          quantity?: number
          ticket_id: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          additional_service_id?: string
          created_at?: string
          id?: string
          quantity?: number
          ticket_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ticket_additional_services_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_event_dates: {
        Row: {
          created_at: string
          event_date_id: string
          id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          event_date_id: string
          id?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          event_date_id?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_event_dates_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_orders: {
        Row: {
          cancelled_at: string | null
          created_at: string
          currency: string
          event_id: string
          expires_at: string | null
          id: string
          order_number: string
          paid_at: string | null
          payment_status: string
          profile_id: string
          promo_code_id: string | null
          service_fee_amount: number
          subtotal_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          event_id: string
          expires_at?: string | null
          id?: string
          order_number: string
          paid_at?: string | null
          payment_status?: string
          profile_id: string
          promo_code_id?: string | null
          service_fee_amount?: number
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          currency?: string
          event_id?: string
          expires_at?: string | null
          id?: string
          order_number?: string
          paid_at?: string | null
          payment_status?: string
          profile_id?: string
          promo_code_id?: string | null
          service_fee_amount?: number
          subtotal_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      ticket_validations: {
        Row: {
          created_at: string
          device_identifier: string | null
          event_date_id: string | null
          id: string
          is_offline_sync: boolean
          ticket_id: string
          validated_at: string
          validated_by_profile_id: string
          validation_method: string
        }
        Insert: {
          created_at?: string
          device_identifier?: string | null
          event_date_id?: string | null
          id?: string
          is_offline_sync?: boolean
          ticket_id: string
          validated_at?: string
          validated_by_profile_id: string
          validation_method: string
        }
        Update: {
          created_at?: string
          device_identifier?: string | null
          event_date_id?: string | null
          id?: string
          is_offline_sync?: boolean
          ticket_id?: string
          validated_at?: string
          validated_by_profile_id?: string
          validation_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_validations_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          event_id: string
          holder_profile_id: string
          id: string
          is_courtesy: boolean
          manual_code: string
          order_id: string
          qr_code: string
          sector_id: string | null
          ticket_status: string
          ticket_type_id: string
          updated_at: string
          validated_at: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          holder_profile_id: string
          id?: string
          is_courtesy?: boolean
          manual_code: string
          order_id: string
          qr_code: string
          sector_id?: string | null
          ticket_status?: string
          ticket_type_id: string
          updated_at?: string
          validated_at?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          holder_profile_id?: string
          id?: string
          is_courtesy?: boolean
          manual_code?: string
          order_id?: string
          qr_code?: string
          sector_id?: string | null
          ticket_status?: string
          ticket_type_id?: string
          updated_at?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "ticket_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlists: {
        Row: {
          created_at: string
          email: string
          event_id: string
          id: string
          notified_at: string | null
          profile_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_id: string
          id?: string
          notified_at?: string | null
          profile_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          notified_at?: string | null
          profile_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      log_audit_event: {
        Args: {
          p_actor_email?: string
          p_actor_id: string
          p_actor_role?: string
          p_description?: string
          p_event_type: Database["public"]["Enums"]["audit_event_type"]
          p_payload?: Json
          p_target_id?: string
          p_target_type?: string
        }
        Returns: string
      }
    }
    Enums: {
      audit_event_type:
        | "auth.login"
        | "auth.logout"
        | "auth.register"
        | "auth.password_reset"
        | "auth.password_change"
        | "profile.update"
        | "profile.critical_change"
        | "admin.action"
      user_role: "ROLE_ADMIN" | "ROLE_PRODUCER" | "ROLE_STAFF" | "ROLE_CUSTOMER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      audit_event_type: [
        "auth.login",
        "auth.logout",
        "auth.register",
        "auth.password_reset",
        "auth.password_change",
        "profile.update",
        "profile.critical_change",
        "admin.action",
      ],
      user_role: ["ROLE_ADMIN", "ROLE_PRODUCER", "ROLE_STAFF", "ROLE_CUSTOMER"],
    },
  },
} as const
