import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Company, Brand, Category, CompanyWithRelations } from '@/types'
import { useCompanies, useBrands, useStats } from '@/composables/useSupabase'

export const useBrandStore = defineStore('brands', () => {
  const companies = ref<Company[]>([])
  const brands = ref<Brand[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref<Category | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Composables
  const { fetchCompanies, fetchCompanyDetails } = useCompanies()
  const { fetchBrands } = useBrands()
  const { fetchStats } = useStats()

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

  function findTopParent(company: Company): Company {
    if (!company.parent_id) return company
    const parent = companies.value.find((c) => c.id === company.parent_id)
    return parent ? findTopParent(parent) : company
  }

  async function getCompanyById(id: string): Promise<CompanyWithRelations | null> {
    try {
      isLoading.value = true
      error.value = null
      const company = await fetchCompanyDetails(id)
      return company
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch company'
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function loadData() {
    isLoading.value = true
    error.value = null
    
    try {
      // Load all companies and brands
      const [companiesResult, brandsResult] = await Promise.all([
        fetchCompanies({ limit: 1000 }),
        fetchBrands({ limit: 1000 })
      ])
      
      companies.value = companiesResult.data
      brands.value = brandsResult.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load data'
      console.error('Failed to load brand data:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function loadStats() {
    try {
      const stats = await fetchStats()
      return stats
    } catch (err) {
      console.error('Failed to load stats:', err)
      return null
    }
  }

  return {
    companies,
    brands,
    searchQuery,
    selectedCategory,
    isLoading,
    error,
    companiesWithBrands,
    topLevelCompanies,
    brandsByCategory,
    filteredBrands,
    statistics,
    getCompanyById,
    loadData,
    loadStats
  }
})