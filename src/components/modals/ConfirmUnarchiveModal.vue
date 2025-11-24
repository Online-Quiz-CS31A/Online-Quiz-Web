<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title?: string
  description?: string
  itemName?: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const displayTitle = computed(() => props.title || 'Unarchive item?')
const displayDescription = computed(() => {
  if (props.description) return props.description
  if (props.itemName) return `This will move "${props.itemName}" back to your active list.`
  return 'This will move the selected item back to your active list.'
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <AlertTriangle class="h-7 w-7 text-emerald-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900">
          {{ displayTitle }}
        </h3>
        <p class="mt-2 text-gray-600">
          {{ displayDescription }}
        </p>
      </div>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          @click="emit('cancel')"
        >
          No, keep archived
        </button>
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow"
          @click="emit('confirm')"
        >
          Yes, unarchive
        </button>
      </div>
    </div>
  </div>
</template>
