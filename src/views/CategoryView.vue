<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBrandStore } from '@/stores/brandStore'
import type { Category } from '@/types'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import BrandCard from '@/components/common/BrandCard.vue'
import { Package, Building2 } from 'lucide-vue-next'

const brandStore = useBrandStore()
const selectedCategory = ref<Category | null>(null)

const categories = computed(() => {
  const categoriesArray = Array.from(brandStore.brandsByCategory.entries())
  return categoriesArray.map(([category, brands]) => ({
    name: category,
    count: brands.length,
    brands
  }))
})

const displayedBrands = computed(() => {
  if (selectedCategory.value) {
    return brandStore.brandsByCategory.get(selectedCategory.value) || []
  }
  return brandStore.filteredBrands
})

const categoryColors: Record<string, string> = {
  'Food & Beverages': 'bg-green-100 text-green-800',
  'Personal Care': 'bg-pink-100 text-pink-800',
  'Household Products': 'bg-blue-100 text-blue-800',
  'Clothing & Fashion': 'bg-purple-100 text-purple-800',
  'Electronics & Technology': 'bg-gray-100 text-gray-800',
  Automotive: 'bg-red-100 text-red-800',
  'Pharmaceuticals/Health': 'bg-teal-100 text-teal-800',
  'Entertainment/Media': 'bg-yellow-100 text-yellow-800',
  Retail: 'bg-orange-100 text-orange-800',
  'Financial Services': 'bg-indigo-100 text-indigo-800',
  'Pet Care': 'bg-amber-100 text-amber-800'
}

function getCategoryColor(category: string) {
  return categoryColors[category] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Browse by Category</h2>
      <p class="text-muted-foreground mt-2">Explore brands organized by product categories</p>
    </div>

    <!-- Category Pills -->
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="category in categories"
        :key="category.name"
        :variant="selectedCategory === category.name ? 'default' : 'secondary'"
        size="sm"
        @click="selectedCategory = selectedCategory === category.name ? null : category.name"
        class="gap-1"
      >
        <span>{{ category.name }}</span>
        <span
          :class="[
            'rounded-full px-1.5 py-0.5 text-xs',
            selectedCategory === category.name
              ? 'bg-primary-foreground/20'
              : getCategoryColor(category.name)
          ]"
        >
          {{ category.count }}
        </span>
      </Button>
    </div>

    <!-- Results Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        {{ selectedCategory ? `${selectedCategory} Brands` : 'All Brands' }}
        <span class="text-muted-foreground ml-2 text-sm">
          ({{ displayedBrands.length }} results)
        </span>
      </h3>
      <Button v-if="selectedCategory" variant="ghost" size="sm" @click="selectedCategory = null">
        Clear Filter
      </Button>
    </div>

    <!-- Brands Grid -->
    <div
      v-if="displayedBrands.length > 0"
      class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <BrandCard v-for="brand in displayedBrands" :key="brand.id" :brand="brand" />
    </div>

    <!-- Empty State -->
    <div v-else class="py-12 text-center">
      <Package class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
      <h3 class="mb-2 text-lg font-semibold">No brands found</h3>
      <p class="text-muted-foreground">Try adjusting your search or category filter</p>
    </div>
  </div>
</template>
