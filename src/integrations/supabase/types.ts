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
          email: string | null
          expires_at: string
          id: string
          max_uses: number
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          max_uses?: number
          organization_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          max_uses?: number
          organization_id?: string | null
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
      coach_availability: {
        Row: {
          buffer_minutes: number
          coach_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean
          start_time: string
          updated_at: string
        }
        Insert: {
          buffer_minutes?: number
          coach_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean
          start_time: string
          updated_at?: string
        }
        Update: {
          buffer_minutes?: number
          coach_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean
          start_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_payouts: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          paid_at: string | null
          period_end: string
          period_start: string
          status: string
          total_amount: number
          total_sessions: number
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: string
          total_amount?: number
          total_sessions?: number
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_amount?: number
          total_sessions?: number
          updated_at?: string
        }
        Relationships: []
      }
      coaching_offerings: {
        Row: {
          category: string
          coach_id: string | null
          created_at: string
          credits_needed: number
          description: string | null
          duration_minutes: number
          id: string
          is_active: boolean | null
          max_participants: number | null
          price: number | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          coach_id?: string | null
          created_at?: string
          credits_needed?: number
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          price?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          coach_id?: string | null
          created_at?: string
          credits_needed?: number
          description?: string | null
          duration_minutes?: number
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          price?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_offerings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      coaching_sessions: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          duration_minutes: number
          id: string
          meeting_link: string | null
          notes: string | null
          organization_id: string
          outcome_tags: string[] | null
          resources: Json | null
          scheduled_at: string
          session_type: string
          status: string
          updated_at: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          organization_id: string
          outcome_tags?: string[] | null
          resources?: Json | null
          scheduled_at: string
          session_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          meeting_link?: string | null
          notes?: string | null
          organization_id?: string
          outcome_tags?: string[] | null
          resources?: Json | null
          scheduled_at?: string
          session_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          content_id: string | null
          content_type: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_public: boolean | null
          mime_type: string | null
          name: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          name: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          name?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tag_relations: {
        Row: {
          content_id: string
          content_type: string
          created_at: string
          id: string
          tag_id: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          tag_id?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          category: string
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
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
      email_events: {
        Row: {
          created_at: string
          email_type: string
          event_key: string
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string
          status: string
        }
        Insert: {
          created_at?: string
          email_type: string
          event_key: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          email_type?: string
          event_key?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string
          status?: string
        }
        Relationships: []
      }
      encrypted_questionnaire_responses: {
        Row: {
          created_at: string
          encryption_key_id: string
          id: string
          response_data_encrypted: string
          response_hash: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          encryption_key_id: string
          id?: string
          response_data_encrypted: string
          response_hash: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          encryption_key_id?: string
          id?: string
          response_data_encrypted?: string
          response_hash?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_tools: {
        Row: {
          access_level: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          name: string
          one_time_purchase: boolean | null
          price: number | null
          tags: string[] | null
          tool_config: Json | null
          tool_type: string
          ui_component: string | null
          updated_at: string
        }
        Insert: {
          access_level?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name: string
          one_time_purchase?: boolean | null
          price?: number | null
          tags?: string[] | null
          tool_config?: Json | null
          tool_type: string
          ui_component?: string | null
          updated_at?: string
        }
        Update: {
          access_level?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          name?: string
          one_time_purchase?: boolean | null
          price?: number | null
          tags?: string[] | null
          tool_config?: Json | null
          tool_type?: string
          ui_component?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      individual_bookings: {
        Row: {
          coach_id: string | null
          created_at: string
          duration_minutes: number
          feedback: string | null
          id: string
          meeting_link: string | null
          notes: string | null
          program_id: string
          purchase_id: string
          rating: number | null
          scheduled_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string
          duration_minutes?: number
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          program_id: string
          purchase_id: string
          rating?: number | null
          scheduled_at: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string
          duration_minutes?: number
          feedback?: string | null
          id?: string
          meeting_link?: string | null
          notes?: string | null
          program_id?: string
          purchase_id?: string
          rating?: number | null
          scheduled_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_bookings_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_bookings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "individual_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_bookings_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "individual_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_programs: {
        Row: {
          category: string
          content_url: string | null
          course_type: string | null
          created_at: string
          description: string | null
          duration: string
          id: string
          is_active: boolean
          level: string
          price: number
          rating: number | null
          students: number | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content_url?: string | null
          course_type?: string | null
          created_at?: string
          description?: string | null
          duration: string
          id?: string
          is_active?: boolean
          level?: string
          price: number
          rating?: number | null
          students?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_url?: string | null
          course_type?: string | null
          created_at?: string
          description?: string | null
          duration?: string
          id?: string
          is_active?: boolean
          level?: string
          price?: number
          rating?: number | null
          students?: number | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      individual_purchases: {
        Row: {
          access_granted_at: string | null
          amount_paid: number
          created_at: string
          expires_at: string | null
          id: string
          last_accessed_at: string | null
          order_id: string | null
          program_id: string
          progress: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_granted_at?: string | null
          amount_paid: number
          created_at?: string
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          order_id?: string | null
          program_id: string
          progress?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_granted_at?: string | null
          amount_paid?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          last_accessed_at?: string | null
          order_id?: string | null
          program_id?: string
          progress?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_purchases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_purchases_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "individual_programs"
            referencedColumns: ["id"]
          },
        ]
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
      mood_check_ins: {
        Row: {
          confidence_level: number
          created_at: string
          financial_concerns: string[] | null
          id: string
          notes: string | null
          stress_level: number
          user_id: string
        }
        Insert: {
          confidence_level: number
          created_at?: string
          financial_concerns?: string[] | null
          id?: string
          notes?: string | null
          stress_level: number
          user_id: string
        }
        Update: {
          confidence_level?: number
          created_at?: string
          financial_concerns?: string[] | null
          id?: string
          notes?: string | null
          stress_level?: number
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      privacy_consents: {
        Row: {
          consent_given: boolean
          consent_type: string
          consent_version: string
          created_at: string
          id: string
          ip_address: unknown | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_given?: boolean
          consent_type: string
          consent_version: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_given?: boolean
          consent_type?: string
          consent_version?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
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
      scheduled_reports: {
        Row: {
          created_at: string
          email: string
          frequency: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          next_run_at: string
          organization_id: string
          report_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          frequency: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_run_at: string
          organization_id: string
          report_type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_run_at?: string
          organization_id?: string
          report_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          event_details: Json
          event_type: string
          id: string
          ip_address: unknown | null
          risk_level: string
          success: boolean
          target_user_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_details?: Json
          event_type: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string
          success: boolean
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_details?: Json
          event_type?: string
          id?: string
          ip_address?: unknown | null
          risk_level?: string
          success?: boolean
          target_user_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      support_queries: {
        Row: {
          attachment_url: string | null
          created_at: string
          description: string
          id: string
          role: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          description: string
          id?: string
          role: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          description?: string
          id?: string
          role?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      tool_purchases: {
        Row: {
          access_granted_at: string | null
          amount_paid: number
          created_at: string
          expires_at: string | null
          id: string
          order_id: string | null
          status: string
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_granted_at?: string | null
          amount_paid?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          status?: string
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_granted_at?: string | null
          amount_paid?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          order_id?: string | null
          status?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_purchases_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_purchases_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "financial_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          booking_reminders: boolean
          created_at: string
          credit_alerts: boolean
          email_notifications: boolean
          id: string
          marketing_emails: boolean
          mood_check_nudges: boolean
          payment_notifications: boolean
          updated_at: string
          user_id: string
          webinar_reminders: boolean
        }
        Insert: {
          booking_reminders?: boolean
          created_at?: string
          credit_alerts?: boolean
          email_notifications?: boolean
          id?: string
          marketing_emails?: boolean
          mood_check_nudges?: boolean
          payment_notifications?: boolean
          updated_at?: string
          user_id: string
          webinar_reminders?: boolean
        }
        Update: {
          booking_reminders?: boolean
          created_at?: string
          credit_alerts?: boolean
          email_notifications?: boolean
          id?: string
          marketing_emails?: boolean
          mood_check_nudges?: boolean
          payment_notifications?: boolean
          updated_at?: string
          user_id?: string
          webinar_reminders?: boolean
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
      calculate_next_run_at: {
        Args: { freq: string; last_sent?: string }
        Returns: string
      }
      create_notification: {
        Args: {
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type?: string
          target_user_id: string
        }
        Returns: string
      }
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
      log_security_event: {
        Args: {
          p_event_details?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_risk_level?: string
          p_success?: boolean
          p_target_user_id?: string
          p_user_agent?: string
          p_user_id?: string
        }
        Returns: string
      }
    }
    Enums: {
      credit_type: "SESSION_1_1" | "WEBINAR"
      order_status: "pending" | "confirmed" | "cancelled" | "completed"
      organization_plan: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE"
      organization_status: "ACTIVE" | "SUSPENDED" | "PENDING"
      outcome_tag:
        | "TAX_CLARITY"
        | "DEBT_PLAN"
        | "SALARY_STRUCT"
        | "EMERGENCY_FUND"
        | "INVESTMENT_START"
        | "BUDGET_CREATE"
        | "CREDIT_IMPROVE"
        | "RETIREMENT_PLAN"
        | "INSURANCE_REVIEW"
        | "EXPENSE_REDUCE"
        | "INCOME_INCREASE"
        | "FINANCIAL_GOAL_SET"
        | "RISK_ASSESSMENT"
        | "PORTFOLIO_REVIEW"
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
      outcome_tag: [
        "TAX_CLARITY",
        "DEBT_PLAN",
        "SALARY_STRUCT",
        "EMERGENCY_FUND",
        "INVESTMENT_START",
        "BUDGET_CREATE",
        "CREDIT_IMPROVE",
        "RETIREMENT_PLAN",
        "INSURANCE_REVIEW",
        "EXPENSE_REDUCE",
        "INCOME_INCREASE",
        "FINANCIAL_GOAL_SET",
        "RISK_ASSESSMENT",
        "PORTFOLIO_REVIEW",
      ],
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
