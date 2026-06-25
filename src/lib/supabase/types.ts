export type Customer = {
  id: string;
  name: string;
  total_orders: number;
  rewards_used: number;
  created_at: string;
  updated_at: string;
};

/** Master pelanggan laundry (terpisah dari loyalty customers) */
export type LaundryCustomer = {
  id: string;
  nama: string;
  nomor_wa: string | null;
  nomor_kamar: string | null;
  created_at: string;
};

export type LaundryQueueItem = {
  id: string;
  no_antrean: string; // format: YYYYMM + 3-digit seq e.g. '202606001'
  customer_id: string | null;
  nama_pelanggan: string; // denormalized copy of LaundryCustomer.nama at time of booking
  jenis_layanan: 'Reguler' | 'Express' | 'Extra Express';
  berat: number;
  tanggal_masuk: string;
  status: 'pending' | 'proses' | 'selesai';
  waktu_proses: string | null;
  waktu_selesai: string | null;
  estimasi_selesai: string | null;
  sudah_bayar: boolean;
  // Joined from laundry_customers (present when fetched with JOIN)
  laundry_customers?: LaundryCustomer | null;
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
      site_settings: {
        Row: { key: string; value: string };
        Insert: { key: string; value: string };
        Update: { key?: string; value?: string };
        Relationships: [];
      };
      laundry_customers: {
        Row: LaundryCustomer;
        Insert: {
          id?: string;
          nama: string;
          nomor_wa?: string | null;
          nomor_kamar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          nomor_wa?: string | null;
          nomor_kamar?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      laundry_queue: {
        Row: LaundryQueueItem;
        Insert: {
          id?: string;
          no_antrean?: string;
          customer_id?: string | null;
          nama_pelanggan: string;
          jenis_layanan: 'Reguler' | 'Express' | 'Extra Express';
          berat: number;
          tanggal_masuk?: string;
          status?: 'pending' | 'proses' | 'selesai';
          waktu_proses?: string | null;
          waktu_selesai?: string | null;
          estimasi_selesai?: string | null;
          sudah_bayar?: boolean;
        };
        Update: {
          id?: string;
          no_antrean?: string;
          customer_id?: string | null;
          nama_pelanggan?: string;
          jenis_layanan?: 'Reguler' | 'Express' | 'Extra Express';
          berat?: number;
          tanggal_masuk?: string;
          status?: 'pending' | 'proses' | 'selesai';
          waktu_proses?: string | null;
          waktu_selesai?: string | null;
          estimasi_selesai?: string | null;
          sudah_bayar?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'laundry_queue_customer_id_fkey';
            columns: ['customer_id'];
            referencedRelation: 'laundry_customers';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
