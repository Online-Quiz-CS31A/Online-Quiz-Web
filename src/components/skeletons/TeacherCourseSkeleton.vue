<template>
  <div class="rounded-xl shadow-md overflow-hidden bg-white animate-pulse">
    <!-- Image -->
    <div class="relative h-36 bg-gray-200 w-full">
      
      <!-- Name -->
      <div class="absolute inset-0 p-4">
        <div class="h-3 w-16 bg-gray-300 rounded mb-2"></div>
        <div class="h-6 w-2/3 bg-gray-300 rounded mb-1"></div>
        <div class="h-6 w-1/2 bg-gray-300 rounded"></div>
      </div>

      <!-- Bottom Profile -->
      <div class="absolute left-4 bottom-3 flex items-center space-x-2 w-full">
        <div class="w-7 h-7 rounded-full bg-gray-300 shadow-sm flex-shrink-0"></div>
        <div class="flex flex-col gap-1 w-full max-w-[120px]">
          <div class="h-3 w-full bg-gray-300 rounded"></div>
          <div class="h-2 w-3/4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Bottom Action -->
    <div class="bg-white px-4 py-3 flex items-center justify-end h-[46px]">
      <div class="h-4 w-20 bg-gray-200 rounded"></div>
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
