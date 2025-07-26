export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // UUID
          user_name: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          user_name: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          user_name?: string;
          updated_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          user_id: string; // UUID
          display_name: string | null;
          avatar_url: string | null;
          preferences: any; // JSONB
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          preferences?: any;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          preferences?: any;
          updated_at?: string | null;
        };
      };
      jquants_tokens: {
        Row: {
          user_id: string; // UUID
          refresh_token: string;
          api_token: string | null;
          plan: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          refresh_token: string;
          api_token?: string | null;
          plan?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          refresh_token?: string;
          api_token?: string | null;
          plan?: string;
          updated_at?: string | null;
        };
      };
      favorites: {
        Row: {
          id: string; // UUID
          user_id: string; // UUID
          stock_code: string;
          fiscal_year: number;
          company_name: string;
          close_price: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          stock_code: string;
          fiscal_year: number;
          company_name: string;
          close_price?: number | null;
          created_at?: string | null;
        };
        Update: {
          company_name?: string;
          close_price?: number | null;
          updated_at?: string | null;
        };
      };
      dividend: {
        Row: {
          stock_code: string;
          company_name: string;
          fiscal_year: number;
          dividend_type: string | null;
          dividend_per_share: number | null;
          source: string | null;
        };
        Insert: {
          stock_code: string;
          company_name: string;
          fiscal_year: number;
          dividend_type?: string | null;
          dividend_per_share?: number | null;
          source?: string | null;
        };
        Update: {
          dividend_type?: string | null;
          dividend_per_share?: number | null;
          source?: string | null;
        };
      };
    };
  };
};