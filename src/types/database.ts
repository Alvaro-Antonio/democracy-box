/**
 * Tipos do Schema do Supabase gerados/adaptados manualmente para o TypeScript.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      chapas: {
        Row: {
          id: string;
          number: number;
          candidate_ids: Json; // array de strings (uuid)
          created_at: string;
        };
        Insert: {
          id?: string;
          number: number;
          candidate_ids: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          number?: number;
          candidate_ids?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      election_settings: {
        Row: {
          id: number;
          is_open: boolean;
          opened_at: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          is_open?: boolean;
          opened_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          is_open?: boolean;
          opened_at?: string | null;
          closed_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          chapa_id: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          chapa_id: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          chapa_id?: string;
          code?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_chapa_id_fkey";
            columns: ["chapa_id"];
            isOneToOne: false;
            referencedRelation: "chapas";
            referencedColumns: ["id"];
          },
        ];
      };
      voter_receipts: {
        Row: {
          voter_id: string;
          created_at: string;
        };
        Insert: {
          voter_id: string;
          created_at?: string;
        };
        Update: {
          voter_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      cast_vote: {
        Args: {
          p_chapa_id: string;
        };
        Returns: string;
      };
      has_voted: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      validate_vote: {
        Args: {
          p_code: string;
        };
        Returns: {
          chapa_number: number;
          candidate_ids: Json;
        }[];
      };
      chapa_vote_counts: {
        Args: Record<PropertyKey, never>;
        Returns: {
          chapa_id: string;
          number: number;
          candidate_ids: Json;
          votes: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
