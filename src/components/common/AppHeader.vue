<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { Menu, X, Building2, Network, Grid3x3 } from 'lucide-vue-next';
import Button from '@/components/ui/Button.vue';
import SearchBar from './SearchBar.vue';

const route = useRoute();
const isMobileMenuOpen = ref(false);

const navigation = [
  { name: 'Dashboard', href: '/', icon: Building2 },
  { name: 'Network', href: '/network', icon: Network },
  { name: 'Categories', href: '/categories', icon: Grid3x3 }
];
</script>

<template>
  <header class="bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur">
    <div class="container mx-auto flex h-16 items-center px-4">
      <div class="flex items-center gap-2">
        <Building2 class="text-primary h-6 w-6" />
        <h1 class="text-xl font-bold">
          Brand Ownership
        </h1>
      </div>

      <nav class="ml-8 hidden gap-6 md:flex">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors',
            route.path === item.href ? 'text-primary' : 'text-muted-foreground'
          ]"
        >
          <component
            :is="item.icon"
            class="h-4 w-4"
          />
          {{ item.name }}
        </router-link>
      </nav>

      <div class="ml-auto flex items-center gap-4">
        <SearchBar class="hidden md:block" />
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          @click="isMobileMenuOpen = !isMobileMenuOpen"
        >
          <Menu
            v-if="!isMobileMenuOpen"
            class="h-5 w-5"
          />
          <X
            v-else
            class="h-5 w-5"
          />
        </Button>
      </div>
    </div>

    <!-- Mobile menu -->
    <div
      v-if="isMobileMenuOpen"
      class="border-t md:hidden"
    >
      <nav class="container mx-auto px-4 py-2">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'hover:text-primary flex items-center gap-2 py-2 text-sm font-medium transition-colors',
            route.path === item.href ? 'text-primary' : 'text-muted-foreground'
          ]"
          @click="isMobileMenuOpen = false"
        >
          <component
            :is="item.icon"
            class="h-4 w-4"
          />
          {{ item.name }}
        </router-link>
        <div class="mt-2">
          <SearchBar />
        </div>
      </nav>
    </div>
  </header>
</template>
