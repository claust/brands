<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useBrandStore } from '@/stores/brandStore'
import AppHeader from '@/components/common/AppHeader.vue'

const brandStore = useBrandStore()

onMounted(() => {
  brandStore.loadData()
})
</script>

<template>
  <div class="bg-background min-h-screen">
    <AppHeader />
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
