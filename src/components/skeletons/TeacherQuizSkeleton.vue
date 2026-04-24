<template>
  <div class="rounded-xl shadow-md overflow-hidden bg-white animate-pulse">
    <!-- Top Content -->
    <div class="p-5 min-h-[180px] flex flex-col justify-between bg-gray-200">
      
      <!-- Top Row -->
      <div class="flex justify-between items-start mb-3">
        <div class="h-3 w-24 bg-gray-300 rounded"></div>
        <div class="w-[4px] h-4 bg-gray-300 rounded-full"></div>
      </div>
      
      <!-- Title & Subject -->
      <div>
        <div class="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
        <div class="h-4 w-1/2 bg-gray-300 rounded mb-2"></div>
      </div>
      
    </div>

    <!-- Bottom Progress / Status Area -->
    <div class="px-5 py-3 h-12 bg-white flex items-center gap-3">
      <div class="h-3 w-1/4 bg-gray-200 rounded"></div>
      <div class="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden"></div>
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
