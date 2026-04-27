<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <LogOut class="h-7 w-7 text-red-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900">
          Logout confirmation
        </h3>
        <p class="mt-2 text-gray-600">
          Are you sure you want to logout? You will need to sign in again to access your account.
        </p>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow transition-colors"
          @click="emit('confirm')"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
