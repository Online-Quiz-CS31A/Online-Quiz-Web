<template>
  <div class="rounded-xl shadow-md overflow-hidden bg-white animate-pulse">
    <!-- Hero -->
    <div class="p-6 h-32 bg-gray-200 relative">
      <div class="relative z-10 space-y-3">
        <!-- Title -->
        <div class="h-6 bg-gray-300 rounded w-3/4"></div>
        <!-- Students Pill -->
        <div class="mt-3 h-5 bg-gray-300 rounded-full w-24 opacity-60"></div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-6 py-3 border-t border-gray-100 bg-white flex items-center">
      <div class="w-4 h-4 bg-gray-200 rounded mr-2"></div>
      <div class="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
</template>


<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
</style>
