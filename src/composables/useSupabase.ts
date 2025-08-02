import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Company, Brand, Category } from '@/types'

export function useCompanies() {
  const companies = ref<Company[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchCompanies = async (options?: {
    search?: string
    page?: number
    limit?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('companies')
        .select('*', { count: 'exact' })

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`)
      }

      const page = options?.page || 1
      const limit = options?.limit || 50
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: supabaseError, count } = await query
        .order('name')
        .range(from, to)

      if (supabaseError) throw supabaseError

      companies.value = data || []
      
      return {
        data: companies.value,
        count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch companies'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCompanyDetails = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      // Get company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (companyError) throw companyError

      // Get brands
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .eq('owner_id', id)
        .order('name')

      if (brandsError) throw brandsError

      // Get subsidiaries
      const { data: subsidiaries, error: subsidiariesError } = await supabase
        .from('companies')
        .select('*')
        .eq('parent_id', id)
        .order('name')

      if (subsidiariesError) throw subsidiariesError

      return {
        ...company,
        brands: brands || [],
        subsidiaries: subsidiaries || []
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch company details'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    fetchCompanyDetails
  }
}

export function useBrands() {
  const brands = ref<Brand[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBrands = async (options?: {
    category?: Category
    search?: string
    page?: number
    limit?: number
  }) => {
    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('brands')
        .select(`
          *,
          company:companies!owner_id(id, name)
        `, { count: 'exact' })

      if (options?.category) {
        query = query.eq('category', options.category)
      }

      if (options?.search) {
        query = query.ilike('name', `%${options.search}%`)
      }

      const page = options?.page || 1
      const limit = options?.limit || 50
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error: supabaseError, count } = await query
        .order('name')
        .range(from, to)

      if (supabaseError) throw supabaseError

      brands.value = data || []
      
      return {
        data: brands.value,
        count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch brands'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    brands,
    loading,
    error,
    fetchBrands
  }
}

export function useSearch() {
  const results = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const search = async (query: string) => {
    if (!query || query.length < 2) {
      results.value = []
      return
    }

    loading.value = true
    error.value = null

    try {
      // Search companies
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, parent_id')
        .ilike('name', `%${query}%`)
        .limit(10)
        .order('name')

      if (companiesError) throw companiesError

      // Search brands
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select(`
          id, 
          name, 
          category,
          company:companies!owner_id(id, name)
        `)
        .ilike('name', `%${query}%`)
        .limit(10)
        .order('name')

      if (brandsError) throw brandsError

      results.value = [
        ...(companies || []).map(c => ({ ...c, type: 'company' })),
        ...(brands || []).map(b => ({ ...b, type: 'brand' }))
      ]
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Search failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    results,
    loading,
    error,
    search
  }
}

export function useStats() {
  const stats = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async () => {
    loading.value = true
    error.value = null

    try {
      // Get total counts
      const { count: companiesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        
      const { count: brandsCount } = await supabase
        .from('brands')
        .select('*', { count: 'exact', head: true })
      
      // Get category distribution
      const { data: brands, error: brandsError } = await supabase
        .from('brands')
        .select('category')
        
      if (brandsError) throw brandsError
      
      // Count brands per category
      const categoryStats = (brands || []).reduce((acc, { category }) => {
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      // Get top companies by brand count
      const { data: topCompanies, error: topError } = await supabase
        .from('companies_with_counts')
        .select('id, name, brand_count, subsidiary_count')
        .order('brand_count', { ascending: false })
        .limit(10)
        
      if (topError) throw topError
      
      // Get parent companies
      const { data: parentCompanies, error: parentError } = await supabase
        .from('companies')
        .select('id')
        .is('parent_id', null)
        
      if (parentError) throw parentError

      stats.value = {
        totalCompanies: companiesCount || 0,
        totalBrands: brandsCount || 0,
        parentCompanies: parentCompanies?.length || 0,
        categoryDistribution: categoryStats,
        topCompanies: topCompanies || [],
        averageBrandsPerCompany: companiesCount ? Math.round((brandsCount || 0) / companiesCount * 10) / 10 : 0
      }

      return stats.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    loading,
    error,
    fetchStats
  }
}