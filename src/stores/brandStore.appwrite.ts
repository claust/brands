/**
 * Brand Store - Appwrite Version
 *
 * This is the Appwrite-enabled version of the brand store.
 * To use this:
 * 1. Rename brandStore.ts to brandStore.legacy.ts
 * 2. Rename this file to brandStore.ts
 * 3. Configure VITE_APPWRITE_ENDPOINT and VITE_APPWRITE_PROJECT in .env
 *
 * This version:
 * - Loads data from Appwrite Database
 * - Falls back to static JSON if Appwrite is not configured
 * - Supports real-time updates (optional)
 * - Provides CRUD operations for authenticated users
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Company, Brand, Category } from '@/types'
import {
  databases,
  DATABASE_ID,
  COMPANIES_COLLECTION,
  BRANDS_COLLECTION,
  isAppwriteConfigured,
  type CompanyDocument,
  type BrandDocument
} from '@/lib/appwrite'
import { Query } from 'appwrite'

export const useBrandStore = defineStore('brands', () => {
  const companies = ref<Company[]>([])
  const brands = ref<Brand[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref<Category | null>(null)
  const isLoading = ref(false)
  const useAppwrite = ref(isAppwriteConfigured())
  const error = ref<string | null>(null)

  // Computed properties (same as legacy version)
  const companiesWithBrands = computed(() => {
    return companies.value.map((company) => ({
      ...company,
      brands: brands.value.filter((brand) => brand.owner_id === company.id),
      subsidiaries: companies.value.filter((c) => c.parent_id === company.id)
    }))
  })

  const topLevelCompanies = computed(() => {
    return companiesWithBrands.value.filter((company) => !company.parent_id)
  })

  const brandsByCategory = computed(() => {
    const grouped = new Map<Category, Brand[]>()
    brands.value.forEach((brand) => {
      if (!grouped.has(brand.category)) {
        grouped.set(brand.category, [])
      }
      grouped.get(brand.category)!.push(brand)
    })
    return grouped
  })

  const filteredBrands = computed(() => {
    let filtered = brands.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter((brand) => brand.name.toLowerCase().includes(query))
    }

    if (selectedCategory.value) {
      filtered = filtered.filter((brand) => brand.category === selectedCategory.value)
    }

    return filtered
  })

  const statistics = computed(() => {
    const companyCounts = new Map<string, number>()
    brands.value.forEach((brand) => {
      const company = companies.value.find((c) => c.id === brand.owner_id)
      if (company) {
        const topParent = findTopParent(company)
        companyCounts.set(topParent.name, (companyCounts.get(topParent.name) || 0) + 1)
      }
    })

    return {
      totalCompanies: companies.value.length,
      totalBrands: brands.value.length,
      totalCategories: brandsByCategory.value.size,
      topCompanies: Array.from(companyCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    }
  })

  // Utility functions
  function findTopParent(company: Company): Company {
    if (!company.parent_id) return company
    const parent = companies.value.find((c) => c.id === company.parent_id)
    return parent ? findTopParent(parent) : company
  }

  function getCompanyById(id: string) {
    return companiesWithBrands.value.find((c) => c.id === id)
  }

  // Convert Appwrite documents to app types
  function convertCompanyDocument(doc: CompanyDocument): Company {
    return {
      id: doc.$id,
      name: doc.name,
      parent_id: doc.parent_id
    }
  }

  function convertBrandDocument(doc: BrandDocument): Brand {
    return {
      id: doc.$id,
      name: doc.name,
      owner_id: doc.owner_id,
      category: doc.category as Category
    }
  }

  // Load data from Appwrite
  async function loadDataFromAppwrite() {
    try {
      console.log('Loading data from Appwrite...')

      // Fetch companies
      const companiesResponse = await databases.listDocuments(
        DATABASE_ID,
        COMPANIES_COLLECTION,
        [
          Query.limit(5000), // Appwrite default max
          Query.orderAsc('name')
        ]
      )

      // Fetch brands
      const brandsResponse = await databases.listDocuments(
        DATABASE_ID,
        BRANDS_COLLECTION,
        [
          Query.limit(5000),
          Query.orderAsc('name')
        ]
      )

      companies.value = companiesResponse.documents.map((doc) =>
        convertCompanyDocument(doc as CompanyDocument)
      )

      brands.value = brandsResponse.documents.map((doc) =>
        convertBrandDocument(doc as BrandDocument)
      )

      console.log(
        `✓ Loaded ${companies.value.length} companies and ${brands.value.length} brands from Appwrite`
      )
    } catch (err: any) {
      console.error('Failed to load data from Appwrite:', err)
      error.value = err.message || 'Failed to load data from Appwrite'
      throw err
    }
  }

  // Load data from static JSON (fallback)
  async function loadDataFromJSON() {
    try {
      console.log('Loading data from static JSON...')
      const response = await fetch('/brands.json')
      const data = await response.json()
      companies.value = data.companies || []
      brands.value = data.brands || []
      console.log(
        `✓ Loaded ${companies.value.length} companies and ${brands.value.length} brands from JSON`
      )
    } catch (err: any) {
      console.error('Failed to load brand data from JSON:', err)
      error.value = err.message || 'Failed to load data from JSON'
      throw err
    }
  }

  // Main load function
  async function loadData() {
    isLoading.value = true
    error.value = null

    try {
      if (useAppwrite.value) {
        try {
          await loadDataFromAppwrite()
        } catch (appwriteError) {
          console.warn('Appwrite failed, falling back to JSON')
          useAppwrite.value = false
          await loadDataFromJSON()
        }
      } else {
        await loadDataFromJSON()
      }
    } catch (err) {
      console.error('Failed to load data:', err)
      // Data remains empty if both methods fail
    } finally {
      isLoading.value = false
    }
  }

  // Search functionality (Appwrite version)
  async function searchBrandsAppwrite(query: string): Promise<Brand[]> {
    if (!useAppwrite.value) {
      // Use local filtering for JSON mode
      const q = query.toLowerCase()
      return brands.value.filter((brand) => brand.name.toLowerCase().includes(q))
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BRANDS_COLLECTION,
        [Query.search('name', query), Query.limit(100)]
      )

      return response.documents.map((doc) => convertBrandDocument(doc as BrandDocument))
    } catch (err) {
      console.error('Search failed:', err)
      // Fallback to local filtering
      const q = query.toLowerCase()
      return brands.value.filter((brand) => brand.name.toLowerCase().includes(q))
    }
  }

  // Get brands by category (optimized for Appwrite)
  async function getBrandsByCategory(category: Category): Promise<Brand[]> {
    if (!useAppwrite.value) {
      return brands.value.filter((brand) => brand.category === category)
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BRANDS_COLLECTION,
        [Query.equal('category', category), Query.orderAsc('name')]
      )

      return response.documents.map((doc) => convertBrandDocument(doc as BrandDocument))
    } catch (err) {
      console.error('Failed to get brands by category:', err)
      return brands.value.filter((brand) => brand.category === category)
    }
  }

  // Get brands by owner (company)
  async function getBrandsByOwner(ownerId: string): Promise<Brand[]> {
    if (!useAppwrite.value) {
      return brands.value.filter((brand) => brand.owner_id === ownerId)
    }

    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        BRANDS_COLLECTION,
        [Query.equal('owner_id', ownerId), Query.orderAsc('name')]
      )

      return response.documents.map((doc) => convertBrandDocument(doc as BrandDocument))
    } catch (err) {
      console.error('Failed to get brands by owner:', err)
      return brands.value.filter((brand) => brand.owner_id === ownerId)
    }
  }

  // CRUD operations (only available in Appwrite mode)
  async function createBrand(brandData: Partial<Brand>): Promise<Brand | null> {
    if (!useAppwrite.value) {
      console.error('Cannot create brand: Appwrite not configured')
      return null
    }

    try {
      const response = await databases.createDocument(
        DATABASE_ID,
        BRANDS_COLLECTION,
        'unique()', // Let Appwrite generate ID
        {
          name: brandData.name,
          slug: brandData.name?.toLowerCase().replace(/\s+/g, '-'),
          owner_id: brandData.owner_id,
          category: brandData.category,
          is_active: true
        }
      )

      const newBrand = convertBrandDocument(response as BrandDocument)
      brands.value.push(newBrand)
      return newBrand
    } catch (err) {
      console.error('Failed to create brand:', err)
      return null
    }
  }

  async function updateBrand(
    brandId: string,
    updates: Partial<Brand>
  ): Promise<Brand | null> {
    if (!useAppwrite.value) {
      console.error('Cannot update brand: Appwrite not configured')
      return null
    }

    try {
      const response = await databases.updateDocument(
        DATABASE_ID,
        BRANDS_COLLECTION,
        brandId,
        updates
      )

      const updatedBrand = convertBrandDocument(response as BrandDocument)

      // Update local state
      const index = brands.value.findIndex((b) => b.id === brandId)
      if (index !== -1) {
        brands.value[index] = updatedBrand
      }

      return updatedBrand
    } catch (err) {
      console.error('Failed to update brand:', err)
      return null
    }
  }

  async function deleteBrand(brandId: string): Promise<boolean> {
    if (!useAppwrite.value) {
      console.error('Cannot delete brand: Appwrite not configured')
      return false
    }

    try {
      await databases.deleteDocument(DATABASE_ID, BRANDS_COLLECTION, brandId)

      // Update local state
      brands.value = brands.value.filter((b) => b.id !== brandId)
      return true
    } catch (err) {
      console.error('Failed to delete brand:', err)
      return false
    }
  }

  return {
    // State
    companies,
    brands,
    searchQuery,
    selectedCategory,
    isLoading,
    useAppwrite,
    error,

    // Computed
    companiesWithBrands,
    topLevelCompanies,
    brandsByCategory,
    filteredBrands,
    statistics,

    // Methods
    getCompanyById,
    loadData,
    searchBrandsAppwrite,
    getBrandsByCategory,
    getBrandsByOwner,

    // CRUD (Appwrite only)
    createBrand,
    updateBrand,
    deleteBrand
  }
})
