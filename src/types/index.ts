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
