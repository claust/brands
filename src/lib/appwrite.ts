/**
 * Appwrite Client Configuration
 *
 * This file sets up the Appwrite client, database, storage, and account services.
 * It also exports constants for database, collection, and bucket IDs.
 */

import { Client, Databases, Storage, Account, type Models } from 'appwrite'

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT || '')

// Initialize services
export const databases = new Databases(client)
export const storage = new Storage(client)
export const account = new Account(client)

// Database and Collection IDs
export const DATABASE_ID = 'brands_db'
export const COMPANIES_COLLECTION = 'companies'
export const BRANDS_COLLECTION = 'brands'
export const CATEGORIES_COLLECTION = 'categories'

// Storage Bucket IDs
export const LOGOS_BUCKET = 'brand-logos'

// Type definitions for Appwrite documents
export interface CompanyDocument extends Models.Document {
  name: string
  slug: string
  parent_id: string | null
  description?: string
  website?: string
  founded?: number
  headquarters?: string
  revenue?: number
  logo_url?: string
  is_public?: boolean
  stock_symbol?: string
  industry?: string[]
}

export interface BrandDocument extends Models.Document {
  name: string
  slug: string
  owner_id: string
  category: string
  sub_category?: string
  description?: string
  website?: string
  founded?: number
  logo_primary?: string
  logo_variant_1?: string
  logo_variant_2?: string
  is_active?: boolean
  market_regions?: string[]
  tags?: string[]
}

export interface CategoryDocument extends Models.Document {
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  parent_category?: string
}

// Helper functions
export function isAppwriteConfigured(): boolean {
  return !!(import.meta.env.VITE_APPWRITE_ENDPOINT && import.meta.env.VITE_APPWRITE_PROJECT)
}

export function getAppwriteConfig() {
  return {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    project: import.meta.env.VITE_APPWRITE_PROJECT,
    isConfigured: isAppwriteConfigured()
  }
}
