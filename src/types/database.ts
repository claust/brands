export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          headquarters: string | null
          founded: number | null
          employees: number | null
          revenue: string | null
          info_search_date: string | null
          info_search_status: 'success' | 'failed' | 'skipped' | null
          info_search_error: string | null
          info_sources: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          parent_id?: string | null
          headquarters?: string | null
          founded?: number | null
          employees?: number | null
          revenue?: string | null
          info_search_date?: string | null
          info_search_status?: 'success' | 'failed' | 'skipped' | null
          info_search_error?: string | null
          info_sources?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          headquarters?: string | null
          founded?: number | null
          employees?: number | null
          revenue?: string | null
          info_search_date?: string | null
          info_search_status?: 'success' | 'failed' | 'skipped' | null
          info_search_error?: string | null
          info_sources?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          owner_id: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          owner_id: string
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      companies_with_counts: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          headquarters: string | null
          founded: number | null
          employees: number | null
          revenue: string | null
          info_search_date: string | null
          info_search_status: 'success' | 'failed' | 'skipped' | null
          info_search_error: string | null
          info_sources: Record<string, any> | null
          created_at: string
          updated_at: string
          brand_count: number
          subsidiary_count: number
        }
      }
    }
  }
}