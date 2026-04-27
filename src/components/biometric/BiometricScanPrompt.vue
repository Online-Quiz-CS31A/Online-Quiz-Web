<script setup lang="ts">
import { ScanLine } from 'lucide-vue-next'

defineProps<{
  message?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-8 px-4">
    <div class="relative">
      <div class="w-24 h-24 rounded-full border-4 border-blue-200 animate-pulse flex items-center justify-center">
        <ScanLine class="w-12 h-12 text-blue-500" />
      </div>
      <div class="absolute inset-0 w-24 h-24 rounded-full border-4 border-blue-400 animate-ping opacity-20" />
    </div>
    <p class="mt-4 text-base font-medium text-gray-900">
      {{ message || 'Please place your finger on the scanner' }}
    </p>
    <p class="mt-1 text-sm text-gray-500">
      Waiting for fingerprint...
    </p>
  </div>
</template>