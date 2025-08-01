<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Brand } from '@/types'
import { useBrandStore } from '@/stores/brandStore'
import { getBrandLogoPath } from '@/utils/logoUtils'
import Card from '@/components/ui/Card.vue'
import { Building2, ArrowRight } from 'lucide-vue-next'

interface Props {
  brand: Brand
}

const props = defineProps<Props>()
const router = useRouter()
const brandStore = useBrandStore()

const owner = computed(() => {
  return brandStore.companies.find((c) => c.id === props.brand.owner_id)
})

const topParent = computed(() => {
  if (!owner.value) return null
  let current = owner.value
  while (current.parent_id) {
    const parent = brandStore.companies.find((c) => c.id === current.parent_id)
    if (!parent) break
    current = parent
  }
  return current
})

const logoPath = computed(() => getBrandLogoPath(props.brand.name, 1))

const categoryColors: Record<string, string> = {
  'Food & Beverages': 'bg-green-100 text-green-800 border-green-200',
  'Personal Care': 'bg-pink-100 text-pink-800 border-pink-200',
  'Household Products': 'bg-blue-100 text-blue-800 border-blue-200',
  'Clothing & Fashion': 'bg-purple-100 text-purple-800 border-purple-200',
  'Electronics & Technology': 'bg-gray-100 text-gray-800 border-gray-200',
  Automotive: 'bg-red-100 text-red-800 border-red-200',
  'Pharmaceuticals/Health': 'bg-teal-100 text-teal-800 border-teal-200',
  'Entertainment/Media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Retail: 'bg-orange-100 text-orange-800 border-orange-200',
  'Financial Services': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Pet Care': 'bg-amber-100 text-amber-800 border-amber-200'
}

function getCategoryColor(category: string) {
  return categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200'
}

function navigateToCompany() {
  if (owner.value) {
    router.push(`/company/${owner.value.id}`)
  }
}
</script>

<template>
  <Card class="group cursor-pointer p-4 transition-all hover:shadow-lg" @click="navigateToCompany">
    <div class="space-y-3">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="flex-shrink-0">
            <img 
              :src="logoPath" 
              :alt="`${brand.name} logo`"
              class="h-8 w-8 rounded-full bg-white border border-gray-200 object-contain p-1"
              @error="$event.target.style.display = 'none'"
            />
          </div>
          <h3 class="group-hover:text-primary text-lg font-semibold transition-colors">
            {{ brand.name }}
          </h3>
        </div>
        <ArrowRight
          class="text-muted-foreground h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>

      <span
        :class="[
          'inline-flex rounded-md border px-2 py-1 text-xs font-medium',
          getCategoryColor(brand.category)
        ]"
      >
        {{ brand.category }}
      </span>

      <div class="space-y-1">
        <div class="flex items-center gap-2 text-sm">
          <Building2 class="text-muted-foreground h-4 w-4" />
          <span class="text-muted-foreground">Owned by:</span>
          <span class="font-medium">{{ owner?.name }}</span>
        </div>

        <div v-if="topParent && topParent.id !== owner?.id" class="flex items-center gap-2 text-sm">
          <div class="w-4" />
          <span class="text-muted-foreground">Parent:</span>
          <span class="font-medium">{{ topParent.name }}</span>
        </div>
      </div>
    </div>
  </Card>
</template>
