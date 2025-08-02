export type Category =
  | 'Food & Beverages'
  | 'Personal Care'
  | 'Household Products'
  | 'Clothing & Fashion'
  | 'Electronics & Technology'
  | 'Automotive'
  | 'Pharmaceuticals/Health'
  | 'Entertainment/Media'
  | 'Retail'
  | 'Financial Services'
  | 'Pet Care'

export interface Company {
  id: string
  name: string
  parent_id: string | null
  // Optional scraped info fields
  headquarters?: string
  founded?: number
  employees?: number
  revenue?: string
  infoSearchDate?: string
  infoSearchStatus?: 'success' | 'failed' | 'skipped'
  infoSearchError?: string
  infoSources?: {
    headquarters?: string
    founded?: string
    employees?: string
    revenue?: string
  }
}

export interface Brand {
  id: string
  name: string
  owner_id: string
  category: Category
}

export interface CompanyWithRelations extends Company {
  brands: Brand[]
  subsidiaries: Company[]
}

export interface InfoSearchProgress {
  lastProcessedIndex: number
  totalCompanies: number
  completedCompanies: string[]
  failedCompanies: string[]
  startTime: string
  lastUpdateTime: string
}

export interface CompanyInfoScraperOptions {
  resume?: boolean
  specificCompany?: string
  delayBetweenSearches?: number
  outputDir?: string
  limit?: number
  headless?: boolean
}
