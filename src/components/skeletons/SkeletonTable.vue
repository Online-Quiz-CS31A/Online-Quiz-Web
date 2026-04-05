<script setup lang="ts">
interface Props {
  rows?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  rows: 10,
  columns: 7
})
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th 
            v-for="col in columns" 
            :key="col" 
            class="px-6 py-3"
          >
            <div class="h-3 bg-gray-200 rounded animate-pulse"></div>
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="row in rows" :key="row" class="animate-pulse">
          <td 
            v-for="col in columns" 
            :key="col" 
            class="px-6 py-4 whitespace-nowrap"
          >
            <div v-if="col === 1" class="flex items-center">
              <div class="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div class="flex-1">
                <div class="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div v-else class="h-3 bg-gray-200 rounded" :class="col === 2 ? 'w-1/2' : 'w-3/4'"></div>
          </td>
        </tr>
      </tbody>
    </table>
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
