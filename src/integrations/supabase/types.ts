export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      airdrop_claims: {
        Row: {
          created_at: string
          eligible: boolean | null
          email: string | null
          id: string
          paid: boolean | null
          payment_tx_hash: string | null
          telegram_handle: string | null
          twitter_handle: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string
          eligible?: boolean | null
          email?: string | null
          id?: string
          paid?: boolean | null
          payment_tx_hash?: string | null
          telegram_handle?: string | null
          twitter_handle?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string
          eligible?: boolean | null
          email?: string | null
          id?: string
          paid?: boolean | null
          payment_tx_hash?: string | null
          telegram_handle?: string | null
          twitter_handle?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      presale_contributions: {
        Row: {
          amount: number
          approved: boolean | null
          created_at: string
          currency: string
          id: string
          tx_hash: string
          wallet_address: string
        }
        Insert: {
          amount: number
          approved?: boolean | null
          created_at?: string
          currency: string
          id?: string
          tx_hash: string
          wallet_address: string
        }
        Update: {
          amount?: number
          approved?: boolean | null
          created_at?: string
          currency?: string
          id?: string
          tx_hash?: string
          wallet_address?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referred_address: string
          referrer_address: string
          reward: number
        }
        Insert: {
          created_at?: string
          id?: string
          referred_address: string
          referrer_address: string
          reward?: number
        }
        Update: {
          created_at?: string
          id?: string
          referred_address?: string
          referrer_address?: string
          reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_address_fkey"
            columns: ["referred_address"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["address"]
          },
          {
            foreignKeyName: "referrals_referrer_address_fkey"
            columns: ["referrer_address"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["address"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string
          destination_url: string | null
          difficulty: string
          id: string
          reward: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          destination_url?: string | null
          difficulty: string
          id?: string
          reward: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          destination_url?: string | null
          difficulty?: string
          id?: string
          reward?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_tasks: {
        Row: {
          completed_at: string
          id: string
          task_id: string
          user_address: string
        }
        Insert: {
          completed_at?: string
          id?: string
          task_id: string
          user_address: string
        }
        Update: {
          completed_at?: string
          id?: string
          task_id?: string
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tasks_user_address_fkey"
            columns: ["user_address"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["address"]
          },
        ]
      }
      users: {
        Row: {
          address: string
          balance: number
          id: string
          is_admin: boolean
          joined_at: string
          referral_code: string
          referred_by: string | null
          total_earned: number
        }
        Insert: {
          address: string
          balance?: number
          id?: string
          is_admin?: boolean
          joined_at?: string
          referral_code: string
          referred_by?: string | null
          total_earned?: number
        }
        Update: {
          address?: string
          balance?: number
          id?: string
          is_admin?: boolean
          joined_at?: string
          referral_code?: string
          referred_by?: string | null
          total_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["address"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_referral_bonus: {
        Args: { referrer_addr: string; bonus_amount: number }
        Returns: undefined
      }
      add_task_reward: {
        Args: { user_addr: string; task_id: string }
        Returns: undefined
      }
      create_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
