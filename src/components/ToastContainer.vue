<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const getToastClasses = (type: string) => {
  const baseClasses = 'flex items-center gap-3 min-w-80 max-w-md p-4 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 ease-in-out'
  
  switch (type) {
    case 'success':
      return `${baseClasses} bg-green-50/95 border-green-200 text-green-800`
    case 'error':
      return `${baseClasses} bg-red-50/95 border-red-200 text-red-800`
    case 'info':
      return `${baseClasses} bg-blue-50/95 border-blue-200 text-blue-800`
    default:
      return `${baseClasses} bg-gray-50/95 border-gray-200 text-gray-800`
  }
}

const getIconClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'fas fa-check-circle text-green-600 text-xl'
    case 'error':
      return 'fas fa-exclamation-circle text-red-600 text-xl'
    case 'info':
      return 'fas fa-info-circle text-blue-600 text-xl'
    default:
      return 'fas fa-bell text-gray-600 text-xl'
  }
}

const getProgressClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-600'
    case 'error':
      return 'bg-red-600'
    case 'info':
      return 'bg-blue-600'
    default:
      return 'bg-gray-600'
  }
}
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-[90vw]">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="relative w-full flex justify-center"
      >
        <div
          :class="getToastClasses(toast.type)"
          class="pointer-events-auto"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <i :class="getIconClasses(toast.type)"></i>
          </div>
          
          <!-- Message -->
          <div class="flex-1 font-medium">
            {{ toast.message }}
          </div>
          
          <!-- Close Button -->
          <button
            @click="remove(toast.id)"
            class="flex-shrink-0 ml-2 text-current opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Close"
          >
            <i class="fas fa-times"></i>
          </button>
          
          <!-- Progress Bar -->
          <div 
            v-if="toast.duration > 0"
            class="absolute bottom-0 left-0 h-1 rounded-b-lg origin-left animate-progress"
            :class="getProgressClasses(toast.type)"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-from {
  transform: translateY(-12px);
  opacity: 0;
}
.toast-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.toast-enter-active {
  transition: transform 180ms ease-out, opacity 180ms ease-out;
}

.toast-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.toast-leave-to {
  transform: translateY(-12px);
  opacity: 0;
}
.toast-leave-active {
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  transition: transform 150ms ease-in, opacity 150ms ease-in;
}

.toast-move {
  transition: transform 150ms ease;
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.animate-progress {
  animation: progress linear;
}
</style>
