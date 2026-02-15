<script setup lang="ts">
interface Props {
  items?: number
}

withDefaults(defineProps<Props>(), {
  items: 5
})
</script>

<template>
  <div class="space-y-3">
    <div v-for="i in items" :key="i" class="p-4 bg-gray-50 rounded-lg animate-pulse">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3 flex-1">
          <div class="w-8 h-8 bg-gray-200 rounded-lg"></div>
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div class="w-20 h-5 bg-gray-200 rounded-full"></div>
      </div>
      <div class="flex items-center gap-4 ml-11">
        <div class="h-2 bg-gray-200 rounded w-24"></div>
        <div class="h-2 bg-gray-200 rounded w-20"></div>
        <div class="h-2 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
