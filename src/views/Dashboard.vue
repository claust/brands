<script setup lang="ts">
import { computed } from 'vue'
import { useBrandStore } from '@/stores/brandStore'
import { Building2, Package, Grid3x3, TrendingUp } from 'lucide-vue-next'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import { useRouter } from 'vue-router'

const brandStore = useBrandStore()
const router = useRouter()

const stats = computed(() => brandStore.statistics)

const statCards = computed(() => [
  {
    title: 'Total Companies',
    value: stats.value.totalCompanies,
    icon: Building2,
    color: 'text-blue-600'
  },
  {
    title: 'Total Brands',
    value: stats.value.totalBrands,
    icon: Package,
    color: 'text-green-600'
  },
  {
    title: 'Categories',
    value: stats.value.totalCategories,
    icon: Grid3x3,
    color: 'text-purple-600'
  },
  {
    title: 'Avg Brands/Company',
    value: Math.round((stats.value.totalBrands / stats.value.totalCompanies) * 10) / 10,
    icon: TrendingUp,
    color: 'text-orange-600'
  }
])
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-3xl font-bold tracking-tight">Brand Ownership Dashboard</h2>
      <p class="text-muted-foreground mt-2">
        Explore the complex relationships between consumer brands and their parent companies
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in statCards" :key="stat.title" class="p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-muted-foreground text-sm font-medium">{{ stat.title }}</p>
            <p class="text-2xl font-bold">{{ stat.value.toLocaleString() }}</p>
          </div>
          <component :is="stat.icon" :class="['h-8 w-8', stat.color]" />
        </div>
      </Card>
    </div>

    <!-- Top Companies -->
    <Card class="p-6">
      <h3 class="mb-4 text-lg font-semibold">Top Companies by Brand Count</h3>
      <div class="space-y-3">
        <div
          v-for="(company, index) in stats.topCompanies"
          :key="company.name"
          class="hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors"
          @click="
            router.push(`/company/${brandStore.companies.find((c) => c.name === company.name)?.id}`)
          "
        >
          <div class="flex items-center gap-3">
            <span class="text-muted-foreground text-2xl font-bold">{{ index + 1 }}</span>
            <div>
              <p class="font-medium">{{ company.name }}</p>
              <p class="text-muted-foreground text-sm">{{ company.count }} brands</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <div class="bg-secondary h-2 w-32 rounded-full">
              <div
                class="bg-primary h-2 rounded-full transition-all"
                :style="{ width: `${(company.count / stats.topCompanies[0].count) * 100}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Quick Actions -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card
        class="cursor-pointer p-6 transition-shadow hover:shadow-lg"
        @click="router.push('/network')"
      >
        <Network class="text-primary mb-3 h-8 w-8" />
        <h3 class="font-semibold">Network Visualization</h3>
        <p class="text-muted-foreground mt-1 text-sm">
          Explore interactive network graph of brand relationships
        </p>
      </Card>
      <Card
        class="cursor-pointer p-6 transition-shadow hover:shadow-lg"
        @click="router.push('/categories')"
      >
        <Grid3x3 class="text-primary mb-3 h-8 w-8" />
        <h3 class="font-semibold">Browse by Category</h3>
        <p class="text-muted-foreground mt-1 text-sm">
          Discover brands organized by product categories
        </p>
      </Card>
      <Card class="p-6 transition-shadow hover:shadow-lg">
        <Building2 class="text-primary mb-3 h-8 w-8" />
        <h3 class="font-semibold">Company Analysis</h3>
        <p class="text-muted-foreground mt-1 text-sm">
          Deep dive into individual company portfolios
        </p>
      </Card>
    </div>
  </div>
</template>
