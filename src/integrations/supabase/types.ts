export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      balance_vouchers: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          id: string
          status: string | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string
          voucher_code: string
          voucher_name: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until: string
          voucher_code: string
          voucher_name: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string
          voucher_code?: string
          voucher_name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          file_url: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          recipient_id: string | null
          recipient_type: string | null
          room_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          content: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          room_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          content?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          recipient_id?: string | null
          recipient_type?: string | null
          room_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          address: string | null
          balance: number | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          last_active: string | null
          phone_number: string | null
          postal_code: string | null
          province: string | null
          registration_date: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          verification_status: string | null
        }
        Insert: {
          address?: string | null
          balance?: number | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          last_active?: string | null
          phone_number?: string | null
          postal_code?: string | null
          province?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Update: {
          address?: string | null
          balance?: number | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          last_active?: string | null
          phone_number?: string | null
          postal_code?: string | null
          province?: string | null
          registration_date?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string | null
          commission_amount: number
          created_at: string | null
          customer_notes: string | null
          id: string
          member_id: string | null
          order_number: string
          partner_id: string | null
          partner_notes: string | null
          payment_status: string | null
          quantity: number | null
          schedule_date: string | null
          schedule_time: string | null
          service_id: string | null
          service_name: string
          service_price: number
          status: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          commission_amount: number
          created_at?: string | null
          customer_notes?: string | null
          id?: string
          member_id?: string | null
          order_number: string
          partner_id?: string | null
          partner_notes?: string | null
          payment_status?: string | null
          quantity?: number | null
          schedule_date?: string | null
          schedule_time?: string | null
          service_id?: string | null
          service_name: string
          service_price: number
          status?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          commission_amount?: number
          created_at?: string | null
          customer_notes?: string | null
          id?: string
          member_id?: string | null
          order_number?: string
          partner_id?: string | null
          partner_notes?: string | null
          payment_status?: string | null
          quantity?: number | null
          schedule_date?: string | null
          schedule_time?: string | null
          service_id?: string | null
          service_name?: string
          service_price?: number
          status?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          account_holder: string | null
          address: string
          approved_by: string | null
          approved_date: string | null
          balance: number | null
          bank_account: string | null
          bank_name: string | null
          business_license: string | null
          business_name: string
          business_type: string
          city: string
          commission_rate: number | null
          created_at: string | null
          email: string
          id: string
          owner_name: string
          phone_number: string
          postal_code: string | null
          province: string
          registration_date: string | null
          status: string | null
          tax_number: string | null
          updated_at: string | null
          user_id: string | null
          verification_notes: string | null
          verification_status: string | null
        }
        Insert: {
          account_holder?: string | null
          address: string
          approved_by?: string | null
          approved_date?: string | null
          balance?: number | null
          bank_account?: string | null
          bank_name?: string | null
          business_license?: string | null
          business_name: string
          business_type: string
          city: string
          commission_rate?: number | null
          created_at?: string | null
          email: string
          id?: string
          owner_name: string
          phone_number: string
          postal_code?: string | null
          province: string
          registration_date?: string | null
          status?: string | null
          tax_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
        }
        Update: {
          account_holder?: string | null
          address?: string
          approved_by?: string | null
          approved_date?: string | null
          balance?: number | null
          bank_account?: string | null
          bank_name?: string | null
          business_license?: string | null
          business_name?: string
          business_type?: string
          city?: string
          commission_rate?: number | null
          created_at?: string | null
          email?: string
          id?: string
          owner_name?: string
          phone_number?: string
          postal_code?: string | null
          province?: string
          registration_date?: string | null
          status?: string | null
          tax_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          verification_notes?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          availability_schedule: Json | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          partner_id: string | null
          price: number
          service_category: string
          service_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          partner_id?: string | null
          price: number
          service_category: string
          service_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          partner_id?: string | null
          price?: number
          service_category?: string
          service_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      topup_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          bank_account: string | null
          created_at: string | null
          id: string
          payment_method: string
          payment_proof: string | null
          processed_at: string | null
          processed_by: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          user_type: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          bank_account?: string | null
          created_at?: string | null
          id?: string
          payment_method: string
          payment_proof?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          user_type: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          bank_account?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string
          payment_proof?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          from_user_id: string | null
          from_user_type: string | null
          id: string
          reference_id: string | null
          reference_type: string | null
          status: string | null
          to_user_id: string | null
          to_user_type: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_user_id?: string | null
          from_user_type?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          to_user_id?: string | null
          to_user_type?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          from_user_id?: string | null
          from_user_type?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          to_user_id?: string | null
          to_user_type?: string | null
          transaction_type?: string
        }
        Relationships: []
      }
      voucher_usage: {
        Row: {
          amount_received: number
          id: string
          used_at: string | null
          user_id: string
          user_type: string
          voucher_id: string | null
        }
        Insert: {
          amount_received: number
          id?: string
          used_at?: string | null
          user_id: string
          user_type: string
          voucher_id?: string | null
        }
        Update: {
          amount_received?: number
          id?: string
          used_at?: string | null
          user_id?: string
          user_type?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voucher_usage_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "balance_vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
