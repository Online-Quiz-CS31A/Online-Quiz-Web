<script setup lang="ts">
import { computed } from 'vue'
import { Wifi, WifiOff, Loader } from 'lucide-vue-next'
import { useBiometricStore } from '@/stores/biometricStore'

const store = useBiometricStore()

const statusColor = computed(() => {
  if (!store.isConnected) return 'bg-red-500'
  switch (store.deviceStatus) {
    case 'Idle': return 'bg-green-500'
    case 'Enrollment': return 'bg-yellow-500'
    case 'Verification': return 'bg-blue-500'
    case 'Connected': return 'bg-green-500'
    default: return 'bg-gray-400'
  }
})

const statusText = computed(() => {
  if (!store.isConnected) return 'Not Connected'
  if (store.deviceStatus === 'Connected') return 'Ready'
  if (store.deviceStatus === 'Idle') return 'Ready'
  if (store.deviceStatus === 'Enrollment') return 'Enrolling'
  if (store.deviceStatus === 'Verification') return 'Verifying'
  return store.deviceStatus
})

const statusIcon = computed(() => {
  if (store.connectionState === 'connecting') return Loader
  if (!store.isConnected) return WifiOff
  return Wifi
})
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:p-5 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
    <div class="flex items-center gap-3">
      <div class="relative">
        <span :class="[statusColor, 'w-3 h-3 rounded-full animate-pulse']" />
        <span :class="[statusColor, 'absolute inset-0 rounded-full animate-ping opacity-75']" />
      </div>
      <component :is="statusIcon" :class="[
        'w-5 h-5',
        store.isConnected ? 'text-green-600' : 'text-red-600',
        store.connectionState === 'connecting' ? 'animate-spin' : ''
      ]" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-gray-900">Scanner Status</p>
      <p :class="[
        'text-sm font-medium mt-0.5',
        store.isConnected ? 'text-green-600' : 'text-red-600'
      ]">
        {{ statusText }}
      </p>
    </div>
    <div v-if="store.activeUserName && store.isConnected" class="text-left sm:text-right">
      <p class="text-xs text-gray-500 font-medium">Currently Processing</p>
      <p class="text-sm font-semibold text-gray-800 truncate max-w-[200px] mt-0.5">{{ store.activeUserName }}</p>
    </div>
  </div>
</template>