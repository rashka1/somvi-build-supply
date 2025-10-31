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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          company: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          whatsapp: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          whatsapp: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          client_name: string
          created_at: string | null
          id: string
          location: string | null
          notes: string | null
          project_name: string | null
          rfq_id: string | null
          stage: string | null
          updated_at: string | null
          whatsapp: string
        }
        Insert: {
          client_name: string
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          project_name?: string | null
          rfq_id?: string | null
          stage?: string | null
          updated_at?: string | null
          whatsapp: string
        }
        Update: {
          client_name?: string
          created_at?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          project_name?: string | null
          rfq_id?: string | null
          stage?: string | null
          updated_at?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      material_suppliers: {
        Row: {
          created_at: string | null
          id: string
          lead_time_days: number | null
          material_id: string
          supplier_id: string
          supplier_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_time_days?: number | null
          material_id: string
          supplier_id: string
          supplier_price?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_time_days?: number | null
          material_id?: string
          supplier_id?: string
          supplier_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_suppliers_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_suppliers_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          somali_name: string
          subcategory: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          somali_name: string
          subcategory?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          somali_name?: string
          subcategory?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rfq_items: {
        Row: {
          client_price: number | null
          created_at: string | null
          id: string
          material_id: string | null
          profit: number | null
          quantity: number
          rfq_id: string
          supplier_1_price: number | null
          supplier_2_price: number | null
          supplier_3_price: number | null
          supplier_4_price: number | null
          supplier_5_price: number | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          client_price?: number | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          profit?: number | null
          quantity: number
          rfq_id: string
          supplier_1_price?: number | null
          supplier_2_price?: number | null
          supplier_3_price?: number | null
          supplier_4_price?: number | null
          supplier_5_price?: number | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          client_price?: number | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          profit?: number | null
          quantity?: number
          rfq_id?: string
          supplier_1_price?: number | null
          supplier_2_price?: number | null
          supplier_3_price?: number | null
          supplier_4_price?: number | null
          supplier_5_price?: number | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_items_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfqs"
            referencedColumns: ["id"]
          },
        ]
      }
      rfqs: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          project_name: string
          rfq_number: string
          status: string | null
          total_profit: number | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          project_name: string
          rfq_number: string
          status?: string | null
          total_profit?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          project_name?: string
          rfq_number?: string
          status?: string | null
          total_profit?: number | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfqs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          company_name: string | null
          created_at: string | null
          global_markup_percent: number | null
          id: string
          logo_url: string | null
          tagline: string | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          global_markup_percent?: number | null
          id?: string
          logo_url?: string | null
          tagline?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          global_markup_percent?: number | null
          id?: string
          logo_url?: string | null
          tagline?: string | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          active: boolean | null
          commission_percent: number | null
          company: string | null
          contact: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          commission_percent?: number | null
          company?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          commission_percent?: number | null
          company?: string | null
          contact?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_rfq_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "assistant"
        | "sales"
        | "procurement"
        | "logistics"
        | "viewer"
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
      app_role: [
        "admin",
        "assistant",
        "sales",
        "procurement",
        "logistics",
        "viewer",
      ],
    },
  },
} as const
