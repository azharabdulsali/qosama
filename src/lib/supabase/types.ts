export type Customer = {
  id: string;
  name: string;
  total_orders: number;
  rewards_used: number;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: Customer;
        Insert: {
          id?: string;
          name: string;
          total_orders?: number;
          rewards_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          total_orders?: number;
          rewards_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
