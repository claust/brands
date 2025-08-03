<script setup lang="ts">
import { cn } from '@/utils/cn'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('bg-card text-card-foreground rounded-xl border shadow', props.class)">
    <slot />
  </div>
</template>

<!-- Card component provides styled container with shadows -->
