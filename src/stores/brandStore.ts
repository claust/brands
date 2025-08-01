import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Company, Brand, Category } from '@/types'

export const useBrandStore = defineStore('brands', () => {
  const companies = ref<Company[]>([])
  const brands = ref<Brand[]>([])
  const searchQuery = ref('')
  const selectedCategory = ref<Category | null>(null)
  const isLoading = ref(false)

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

  function getCompanyById(id: string) {
    return companiesWithBrands.value.find((c) => c.id === id)
  }

  async function loadData() {
    isLoading.value = true
    try {
      const response = await fetch('/brands.json')
      const data = await response.json()
      companies.value = data.companies || []
      brands.value = data.brands || []
    } catch (error) {
      console.error('Failed to load brand data:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    companies,
    brands,
    searchQuery,
    selectedCategory,
    isLoading,
    companiesWithBrands,
    topLevelCompanies,
    brandsByCategory,
    filteredBrands,
    statistics,
    getCompanyById,
    loadData
  }
})
