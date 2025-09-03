<script setup lang="ts">
</script>


<template>
  <header class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900"></h1>
      <div class="flex items-center space-x-4">
        <div class="relative">
          <button class="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i class="fas fa-bell text-gray-600"></i>
            <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 notification-badge"></span>
          </button>
        </div>
        <div class="flex items-center">
          <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">C</div>
          <span class="ml-2 text-gray-700 hidden md:inline">Chitoge</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.gradient-bg {
  background: linear-gradient(135deg, #4285F4 0%, #34A853 50%, #FBBC05 100%);
}

.notification-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
