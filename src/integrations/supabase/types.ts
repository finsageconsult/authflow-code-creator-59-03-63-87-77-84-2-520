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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      access_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          max_uses: number
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          max_uses?: number
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          max_uses?: number
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "access_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymized_insights: {
        Row: {
          active_participants: number | null
          avg_confidence_level: number | null
          avg_stress_level: number | null
          completion_rates: Json | null
          created_at: string
          id: string
          insight_date: string
          mood_distribution: Json | null
          one_on_one_booking_rate: number | null
          organization_id: string
          tool_usage_rate: number | null
          top_concerns: Json | null
          total_employees: number | null
          webinar_attendance_rate: number | null
        }
        Insert: {
          active_participants?: number | null
          avg_confidence_level?: number | null
          avg_stress_level?: number | null
          completion_rates?: Json | null
          created_at?: string
          id?: string
          insight_date?: string
          mood_distribution?: Json | null
          one_on_one_booking_rate?: number | null
          organization_id: string
          tool_usage_rate?: number | null
          top_concerns?: Json | null
          total_employees?: number | null
          webinar_attendance_rate?: number | null
        }
        Update: {
          active_participants?: number | null
          avg_confidence_level?: number | null
          avg_stress_level?: number | null
          completion_rates?: Json | null
          created_at?: string
          id?: string
          insight_date?: string
          mood_distribution?: Json | null
          one_on_one_booking_rate?: number | null
          organization_id?: string
          tool_usage_rate?: number | null
          top_concerns?: Json | null
          total_employees?: number | null
          webinar_attendance_rate?: number | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          organization_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          booking_id: string | null
          created_at: string
          created_by: string | null
          delta: number
          id: string
          reason: string
          wallet_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          delta: number
          id?: string
          reason: string
          wallet_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          delta?: number
          id?: string
          reason?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "credit_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_wallets: {
        Row: {
          balance: number
          created_at: string
          credit_type: Database["public"]["Enums"]["credit_type"]
          expires_at: string | null
          id: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["owner_type"]
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          credit_type: Database["public"]["Enums"]["credit_type"]
          expires_at?: string | null
          id?: string
          owner_id: string
          owner_type: Database["public"]["Enums"]["owner_type"]
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          credit_type?: Database["public"]["Enums"]["credit_type"]
          expires_at?: string | null
          id?: string
          owner_id?: string
          owner_type?: Database["public"]["Enums"]["owner_type"]
          updated_at?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_type: string | null
          metadata: Json | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_type?: string | null
          metadata?: Json | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string | null
          metadata?: Json | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          billing_address: Json | null
          billing_month: string
          cgst_amount: number | null
          created_at: string | null
          currency: string | null
          due_date: string
          gst_rate: number | null
          gstin: string | null
          id: string
          igst_amount: number | null
          invoice_number: string
          metadata: Json | null
          organization_id: string
          paid_at: string | null
          place_of_supply: string | null
          sgst_amount: number | null
          status: string | null
          subtotal_amount: number
          total_amount: number
          total_gst_amount: number | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          billing_month: string
          cgst_amount?: number | null
          created_at?: string | null
          currency?: string | null
          due_date: string
          gst_rate?: number | null
          gstin?: string | null
          id?: string
          igst_amount?: number | null
          invoice_number: string
          metadata?: Json | null
          organization_id: string
          paid_at?: string | null
          place_of_supply?: string | null
          sgst_amount?: number | null
          status?: string | null
          subtotal_amount: number
          total_amount: number
          total_gst_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          billing_month?: string
          cgst_amount?: number | null
          created_at?: string | null
          currency?: string | null
          due_date?: string
          gst_rate?: number | null
          gstin?: string | null
          id?: string
          igst_amount?: number | null
          invoice_number?: string
          metadata?: Json | null
          organization_id?: string
          paid_at?: string | null
          place_of_supply?: string | null
          sgst_amount?: number | null
          status?: string | null
          subtotal_amount?: number
          total_amount?: number
          total_gst_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          currency: string | null
          final_amount: number
          gst_amount: number | null
          id: string
          metadata: Json | null
          order_number: string
          organization_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          quantity: number
          service_type: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          unit_price: number
          updated_at: string | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          final_amount: number
          gst_amount?: number | null
          id?: string
          metadata?: Json | null
          order_number: string
          organization_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          quantity?: number
          service_type: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          unit_price: number
          updated_at?: string | null
          user_id?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          final_amount?: number
          gst_amount?: number | null
          id?: string
          metadata?: Json | null
          order_number?: string
          organization_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          quantity?: number
          service_type?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: [
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_plans: {
        Row: {
          billing_cycle: string
          created_at: string
          credit_allotment_1on1: number
          credit_allotment_webinar: number
          id: string
          organization_id: string
          plan_type: string
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          credit_allotment_1on1?: number
          credit_allotment_webinar?: number
          id?: string
          organization_id: string
          plan_type: string
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          credit_allotment_1on1?: number
          credit_allotment_webinar?: number
          id?: string
          organization_id?: string
          plan_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: Database["public"]["Enums"]["organization_plan"]
          status: Database["public"]["Enums"]["organization_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: Database["public"]["Enums"]["organization_plan"]
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: Database["public"]["Enums"]["organization_plan"]
          status?: Database["public"]["Enums"]["organization_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          captured_at: string | null
          created_at: string | null
          currency: string | null
          failure_reason: string | null
          id: string
          metadata: Json | null
          order_id: string
          payment_method: string | null
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          captured_at?: string | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          order_id: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          captured_at?: string | null
          created_at?: string | null
          currency?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string
          payment_method?: string | null
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      program_communications: {
        Row: {
          communication_type: string
          created_at: string
          created_by: string
          id: string
          message_body: string
          organization_id: string
          recipient_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          webinar_id: string | null
        }
        Insert: {
          communication_type: string
          created_at?: string
          created_by: string
          id?: string
          message_body: string
          organization_id: string
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          webinar_id?: string | null
        }
        Update: {
          communication_type?: string
          created_at?: string
          created_by?: string
          id?: string
          message_body?: string
          organization_id?: string
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_communications_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          anonymized_concerns: string[] | null
          category: string | null
          coach_id: string | null
          created_at: string
          description: string | null
          employee_id: string
          hr_id: string
          id: string
          organization_id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          ticket_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          anonymized_concerns?: string[] | null
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          employee_id: string
          hr_id: string
          id?: string
          organization_id: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          ticket_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          anonymized_concerns?: string[] | null
          category?: string | null
          coach_id?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string
          hr_id?: string
          id?: string
          organization_id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          ticket_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          created_at: string
          created_by: string | null
          credits_required: number | null
          current_participants: number | null
          description: string | null
          duration_minutes: number | null
          id: string
          instructor_bio: string | null
          instructor_name: string | null
          max_participants: number | null
          meeting_link: string | null
          organization_id: string
          recording_link: string | null
          scheduled_date: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          credits_required?: number | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          organization_id: string
          recording_link?: string | null
          scheduled_date: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          credits_required?: number | null
          current_participants?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          organization_id?: string
          recording_link?: string | null
          scheduled_date?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_org_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      credit_type: "SESSION_1_1" | "WEBINAR"
      order_status: "pending" | "confirmed" | "cancelled" | "completed"
      organization_plan: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE"
      organization_status: "ACTIVE" | "SUSPENDED" | "PENDING"
      owner_type: "ORG" | "USER"
      payment_method: "razorpay" | "credits"
      payment_status:
        | "pending"
        | "authorized"
        | "captured"
        | "failed"
        | "refunded"
      user_role: "ADMIN" | "HR" | "EMPLOYEE" | "COACH" | "INDIVIDUAL"
      user_status: "ACTIVE" | "INACTIVE" | "PENDING"
      user_type: "individual" | "employee" | "organization"
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
      credit_type: ["SESSION_1_1", "WEBINAR"],
      order_status: ["pending", "confirmed", "cancelled", "completed"],
      organization_plan: ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"],
      organization_status: ["ACTIVE", "SUSPENDED", "PENDING"],
      owner_type: ["ORG", "USER"],
      payment_method: ["razorpay", "credits"],
      payment_status: [
        "pending",
        "authorized",
        "captured",
        "failed",
        "refunded",
      ],
      user_role: ["ADMIN", "HR", "EMPLOYEE", "COACH", "INDIVIDUAL"],
      user_status: ["ACTIVE", "INACTIVE", "PENDING"],
      user_type: ["individual", "employee", "organization"],
    },
  },
} as const
