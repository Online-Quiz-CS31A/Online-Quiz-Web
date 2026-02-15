<template>
  <div class="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm animate-pulse">
    <div class="p-5">
      <div class="flex items-center justify-between h-20">
        <div class="flex items-center flex-1">
          <div class="flex-shrink-0 w-12 h-12 bg-gray-200 rounded-md"></div>
          <div class="ml-4 flex-1">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div class="w-16 h-6 bg-gray-200 rounded-full"></div>
      </div>
      <div class="mt-4">
        <div class="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
    <div class="px-5 py-3 bg-gray-50">
      <div class="flex justify-between items-center">
        <div class="h-5 bg-gray-200 rounded w-20"></div>
        <div class="flex gap-2">
          <div class="w-5 h-5 bg-gray-200 rounded"></div>
          <div class="w-5 h-5 bg-gray-200 rounded"></div>
        </div>
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
