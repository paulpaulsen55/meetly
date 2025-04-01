export type ShopItemRow = Database['public']['Tables']['shop_items']['Row'];
export type Quest = Database['public']['Tables']['user_quests']['Row'];


export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      actions: {
        Row: {
          coins: number | null
          description: string | null
          icon: string | null
          id: number
          name: string | null
        }
        Insert: {
          coins?: number | null
          description?: string | null
          icon?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          coins?: number | null
          description?: string | null
          icon?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      shop_items: {
        Row: {
          amount: number | null
          bonus: string | null
          description: string | null
          duration: number | null
          icon: string | null
          id: number
          name: string | null
          price: string | null
          tab: number | null
        }
        Insert: {
          amount?: number | null
          bonus?: string | null
          description?: string | null
          duration?: number | null
          icon?: string | null
          id?: number
          name?: string | null
          price?: string | null
          tab?: number | null
        }
        Update: {
          amount?: number | null
          bonus?: string | null
          description?: string | null
          duration?: number | null
          icon?: string | null
          id?: number
          name?: string | null
          price?: string | null
          tab?: number | null
        }
        Relationships: []
      }
      social_friends: {
        Row: {
          friends_id: string
          user_id: string
        }
        Insert: {
          friends_id: string
          user_id?: string
        }
        Update: {
          friends_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friends_friends_id_fkey"
            columns: ["friends_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friends_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      social_quests: {
        Row: {
          description: string | null
          id: number
          prize: number | null
          title: string | null
        }
        Insert: {
          description?: string | null
          id?: number
          prize?: number | null
          title?: string | null
        }
        Update: {
          description?: string | null
          id?: number
          prize?: number | null
          title?: string | null
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_id: number | null
          created_at: string | null
          id: number
          user_id: string
        }
        Insert: {
          action_id?: number | null
          created_at?: string | null
          id?: number
          user_id?: string
        }
        Update: {
          action_id?: number | null
          created_at?: string | null
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_actions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "actions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coins: {
        Row: {
          coins: number
          user_id: string
        }
        Insert: {
          coins?: number
          user_id?: string
        }
        Update: {
          coins?: number
          user_id?: string
        }
        Relationships: []
      }
      user_events: {
        Row: {
          event: Json | null
          id: number
          user_id: string
        }
        Insert: {
          event?: Json | null
          id?: number
          user_id?: string
        }
        Update: {
          event?: Json | null
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      user_items: {
        Row: {
          bought: string
          id: number
          item_id: number | null
          user_id: string
        }
        Insert: {
          bought?: string
          id?: number
          item_id?: number | null
          user_id?: string
        }
        Update: {
          bought?: string
          id?: number
          item_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          displayname: string
          settings: Json | null
          user_id: string
        }
        Insert: {
          displayname: string
          settings?: Json | null
          user_id?: string
        }
        Update: {
          displayname?: string
          settings?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_quests: {
        Row: {
          id: number
          quest_id: number
          status: string | null
          user1: string
          user1_completed: boolean | null
          user2: string
          user2_completed: boolean | null
        }
        Insert: {
          id?: number
          quest_id: number
          status?: string | null
          user1?: string
          user1_completed?: boolean | null
          user2: string
          user2_completed?: boolean | null
        }
        Update: {
          id?: number
          quest_id?: number
          status?: string | null
          user1?: string
          user1_completed?: boolean | null
          user2?: string
          user2_completed?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_quests_quest_id_fkey"
            columns: ["quest_id"]
            isOneToOne: false
            referencedRelation: "social_quests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quests_user1_fkey"
            columns: ["user1"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_quests_user2_fkey"
            columns: ["user2"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_friend_quest: {
        Args: {
          friend_id: string
        }
        Returns: undefined
      }
      has_started_quest: {
        Args: {
          user_id: string
        }
        Returns: boolean
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
