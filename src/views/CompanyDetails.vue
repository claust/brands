<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBrandStore } from '@/stores/brandStore'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import BrandCard from '@/components/common/BrandCard.vue'
import { Building2, Package, ArrowLeft, Network, Users, DollarSign, Globe, TrendingUp, MapPin, Calendar } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const brandStore = useBrandStore()

const company = computed(() => {
  return brandStore.getCompanyById(route.params.id as string)
})

const parentCompany = computed(() => {
  if (!company.value?.parent_id) return null
  return brandStore.companies.find((c) => c.id === company.value.parent_id)
})

const stats = computed(() => {
  if (!company.value) return null

  const allBrands = [...(company.value.brands || [])]
  const allSubsidiaries = getAllSubsidiaries(company.value)
  allSubsidiaries.forEach((sub) => {
    if (sub.brands && Array.isArray(sub.brands)) {
      allBrands.push(...sub.brands)
    }
  })

  const categories = new Set(allBrands.map((b) => b.category))

  return {
    directBrands: (company.value.brands || []).length,
    totalBrands: allBrands.length,
    subsidiaries: (company.value.subsidiaries || []).length,
    categories: categories.size
  }
})

// Enhanced fake company data
const companyInfo = computed(() => {
  if (!company.value) return null
  
  // Generate fake but realistic company data based on company name
  const fakeData = {
    nestle: {
      founded: '1866',
      headquarters: 'Vevey, Switzerland',
      employees: '273,000',
      revenue: '$94.4B',
      marketCap: '$310B',
      ceo: 'Mark Schneider',
      description: 'Nestlé is the world\'s largest food and beverage company, operating in 186 countries with over 2000 brands ranging from global icons to local favorites.',
      keyMarkets: ['Europe', 'Americas', 'Asia-Pacific'],
      ticker: 'NESN'
    },
    pepsico: {
      founded: '1965',
      headquarters: 'Purchase, New York, USA',
      employees: '315,000',
      revenue: '$86.4B',
      marketCap: '$230B',
      ceo: 'Ramon Laguarta',
      description: 'PepsiCo is a leading food and beverage company with brands consumed more than one billion times a day in more than 200 countries.',
      keyMarkets: ['North America', 'Latin America', 'Europe', 'Asia-Pacific'],
      ticker: 'PEP'
    },
    coca_cola: {
      founded: '1892',
      headquarters: 'Atlanta, Georgia, USA',
      employees: '82,500',
      revenue: '$45.7B',
      marketCap: '$265B',
      ceo: 'James Quincey',
      description: 'The Coca-Cola Company is the world\'s largest beverage company, refreshing consumers with more than 500 sparkling and still brands.',
      keyMarkets: ['North America', 'Latin America', 'Europe', 'Asia-Pacific', 'Africa'],
      ticker: 'KO'
    },
    unilever: {
      founded: '1929',
      headquarters: 'London, UK',
      employees: '190,000',
      revenue: '$62.0B',
      marketCap: '$140B',
      ceo: 'Hein Schumacher',
      description: 'Unilever is one of the world\'s leading suppliers of Beauty & Personal Care, Home Care, and Foods & Refreshment products.',
      keyMarkets: ['Europe', 'Asia-Pacific', 'Americas', 'Africa'],
      ticker: 'UL'
    },
    mars_inc: {
      founded: '1911',
      headquarters: 'McLean, Virginia, USA',
      employees: '140,000',
      revenue: '$47.0B',
      marketCap: 'Private',
      ceo: 'Poul Weihrauch',
      description: 'Mars is a family-owned business with more than a century of history making diverse products and offering services for people and the pets people love.',
      keyMarkets: ['Global Operations', 'North America', 'Europe', 'Asia'],
      ticker: 'Private Company'
    }
  }
  
  // Return specific data or generate generic data
  return fakeData[company.value.id as keyof typeof fakeData] || {
    founded: Math.floor(Math.random() * 50 + 1950).toString(),
    headquarters: 'Global',
    employees: `${Math.floor(Math.random() * 200 + 50)}K`,
    revenue: `$${Math.floor(Math.random() * 80 + 10)}B`,
    marketCap: `$${Math.floor(Math.random() * 300 + 50)}B`,
    ceo: 'Leadership Team',
    description: `${company.value.name} is a leading global company operating across multiple markets and categories.`,
    keyMarkets: ['North America', 'Europe', 'Asia-Pacific'],
    ticker: 'N/A'
  }
})

function getAllSubsidiaries(company: any): any[] {
  const subs: any[] = []
  if (company.subsidiaries && Array.isArray(company.subsidiaries)) {
    company.subsidiaries.forEach((sub: any) => {
      subs.push(sub)
      subs.push(...getAllSubsidiaries(sub))
    })
  }
  return subs
}
</script>

<template>
  <div v-if="company" class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div class="flex-1">
        <div class="flex items-center gap-3">
          <h2 class="text-3xl font-bold tracking-tight">{{ company.name }}</h2>
          <span v-if="companyInfo?.ticker && companyInfo.ticker !== 'N/A'" 
                class="bg-muted text-muted-foreground rounded-md px-2 py-1 text-sm font-medium">
            {{ companyInfo.ticker }}
          </span>
        </div>
        <div v-if="parentCompany" class="text-muted-foreground mt-1">
          Subsidiary of
          <router-link
            :to="`/company/${parentCompany.id}`"
            class="hover:text-primary transition-colors font-medium"
          >
            {{ parentCompany.name }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- Company Overview -->
    <Card class="p-6">
      <h3 class="mb-4 text-lg font-semibold">Company Overview</h3>
      <p class="text-muted-foreground mb-6">{{ companyInfo?.description }}</p>
      
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="flex items-center gap-3">
          <Calendar class="h-5 w-5 text-blue-600" />
          <div>
            <p class="text-muted-foreground text-sm">Founded</p>
            <p class="font-semibold">{{ companyInfo?.founded }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <MapPin class="h-5 w-5 text-green-600" />
          <div>
            <p class="text-muted-foreground text-sm">Headquarters</p>
            <p class="font-semibold">{{ companyInfo?.headquarters }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <Users class="h-5 w-5 text-purple-600" />
          <div>
            <p class="text-muted-foreground text-sm">Employees</p>
            <p class="font-semibold">{{ companyInfo?.employees }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <Building2 class="h-5 w-5 text-orange-600" />
          <div>
            <p class="text-muted-foreground text-sm">CEO</p>
            <p class="font-semibold">{{ companyInfo?.ceo }}</p>
          </div>
        </div>
      </div>
    </Card>

    <!-- Financial Stats -->
    <div class="grid gap-4 md:grid-cols-2">
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <DollarSign class="h-8 w-8 text-green-600" />
          <div>
            <p class="text-muted-foreground text-sm">Annual Revenue</p>
            <p class="text-2xl font-bold">{{ companyInfo?.revenue }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <TrendingUp class="h-8 w-8 text-blue-600" />
          <div>
            <p class="text-muted-foreground text-sm">Market Cap</p>
            <p class="text-2xl font-bold">{{ companyInfo?.marketCap }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Portfolio Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card class="p-4">
        <div class="flex items-center gap-3">
          <Package class="h-8 w-8 text-blue-600" />
          <div>
            <p class="text-muted-foreground text-sm">Direct Brands</p>
            <p class="text-2xl font-bold">{{ stats?.directBrands }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <Package class="h-8 w-8 text-green-600" />
          <div>
            <p class="text-muted-foreground text-sm">Total Brands</p>
            <p class="text-2xl font-bold">{{ stats?.totalBrands }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <Building2 class="h-8 w-8 text-purple-600" />
          <div>
            <p class="text-muted-foreground text-sm">Subsidiaries</p>
            <p class="text-2xl font-bold">{{ stats?.subsidiaries }}</p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-center gap-3">
          <Network class="h-8 w-8 text-orange-600" />
          <div>
            <p class="text-muted-foreground text-sm">Categories</p>
            <p class="text-2xl font-bold">{{ stats?.categories }}</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Key Markets -->
    <Card class="p-6">
      <h3 class="mb-4 text-lg font-semibold flex items-center gap-2">
        <Globe class="h-5 w-5" />
        Key Markets
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="market in companyInfo?.keyMarkets"
          :key="market"
          class="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-medium"
        >
          {{ market }}
        </span>
      </div>
    </Card>

    <!-- Subsidiaries -->
    <div v-if="(company.subsidiaries || []).length > 0">
      <h3 class="mb-4 text-xl font-semibold">Subsidiaries</h3>
      <div class="grid gap-3 md:grid-cols-2">
        <Card
          v-for="subsidiary in (company.subsidiaries || [])"
          :key="subsidiary.id"
          class="cursor-pointer p-4 transition-all hover:shadow-lg"
          @click="router.push(`/company/${subsidiary.id}`)"
        >
          <div class="flex items-center justify-between">
            <div>
              <h4 class="font-semibold">{{ subsidiary.name }}</h4>
              <p class="text-muted-foreground mt-1 text-sm">
                {{ (subsidiary.brands || []).length }} brands
              </p>
            </div>
            <ArrowLeft class="text-muted-foreground h-4 w-4 rotate-180" />
          </div>
        </Card>
      </div>
    </div>

    <!-- Brands -->
    <div>
      <h3 class="mb-4 text-xl font-semibold">Brands ({{ (company.brands || []).length }})</h3>
      <div v-if="(company.brands || []).length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BrandCard v-for="brand in (company.brands || [])" :key="brand.id" :brand="brand" />
      </div>
      <Card v-else class="p-8 text-center">
        <Package class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p class="text-muted-foreground">No brands directly owned by this company</p>
      </Card>
    </div>
  </div>

  <!-- Not Found State -->
  <div v-else class="py-12 text-center">
    <Building2 class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
    <h3 class="mb-2 text-lg font-semibold">Company not found</h3>
    <Button @click="router.push('/')"> Return to Dashboard </Button>
  </div>
</template>
