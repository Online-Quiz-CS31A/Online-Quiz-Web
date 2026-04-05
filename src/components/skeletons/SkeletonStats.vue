<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div v-for="i in 4" :key="i" class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm animate-pulse">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
          <div class="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div class="h-2 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div class="p-3 bg-gray-200 rounded-xl w-14 h-14"></div>
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
