<script setup lang="ts">
import NetworkGraph from '@/components/visualizations/NetworkGraph.vue'
import Card from '@/components/ui/Card.vue'
</script>

<template>
  <div class="h-[calc(100vh-12rem)]">
    <div class="mb-6">
      <h2 class="text-3xl font-bold tracking-tight">Network Visualization</h2>
      <p class="text-muted-foreground mt-2">
        Interactive graph showing relationships between companies and their brands
      </p>
    </div>

    <Card class="h-full p-4">
      <NetworkGraph />
    </Card>
  </div>
</template>
