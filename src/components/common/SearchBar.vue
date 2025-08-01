<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from 'lucide-vue-next'
import { useBrandStore } from '@/stores/brandStore'
import { useRouter } from 'vue-router'

const brandStore = useBrandStore()
const router = useRouter()
const localQuery = ref('')
const isFocused = ref(false)

const suggestions = computed(() => {
  if (!localQuery.value || localQuery.value.length < 2) return []

  const query = localQuery.value.toLowerCase()
  const matchingBrands = brandStore.brands
    .filter((brand) => brand.name.toLowerCase().includes(query))
    .slice(0, 5)

  const matchingCompanies = brandStore.companies
    .filter((company) => company.name.toLowerCase().includes(query))
    .slice(0, 5)

  return [
    ...matchingBrands.map((brand) => ({ type: 'brand', item: brand })),
    ...matchingCompanies.map((company) => ({ type: 'company', item: company }))
  ]
})

function handleSearch() {
  brandStore.searchQuery = localQuery.value
  router.push('/categories')
  isFocused.value = false
}

function selectSuggestion(suggestion: any) {
  if (suggestion.type === 'company') {
    router.push(`/company/${suggestion.item.id}`)
  } else {
    brandStore.searchQuery = suggestion.item.name
    router.push('/categories')
  }
  localQuery.value = ''
  isFocused.value = false
}
</script>

<template>
  <div class="relative w-full max-w-sm">
    <form @submit.prevent="handleSearch" class="relative">
      <Search class="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <input
        v-model="localQuery"
        type="search"
        placeholder="Search brands or companies..."
        class="bg-background focus:ring-ring h-9 w-full rounded-md border pr-3 pl-9 text-sm outline-none focus:ring-1"
        @focus="isFocused = true"
        @blur="setTimeout(() => (isFocused = false), 200)"
      />
    </form>

    <div
      v-if="isFocused && suggestions.length > 0"
      class="bg-popover absolute top-full mt-1 w-full rounded-md border p-1 shadow-md"
    >
      <button
        v-for="(suggestion, index) in suggestions"
        :key="index"
        class="hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm"
        @click="selectSuggestion(suggestion)"
      >
        <span class="text-muted-foreground text-xs">
          {{ suggestion.type === 'brand' ? 'Brand' : 'Company' }}
        </span>
        <span class="flex-1 text-left">{{ suggestion.item.name }}</span>
      </button>
    </div>
  </div>
</template>
