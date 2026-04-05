<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{ 
  open: boolean
  unansweredCount: number
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div class="text-center">
          <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center">
            <AlertTriangle class="h-7 w-7 text-yellow-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Submit with unanswered questions?</h3>
          <p class="mt-2 text-gray-600">
            You still have <span class="font-semibold text-gray-900">{{ unansweredCount }}</span> unanswered
            {{ unansweredCount === 1 ? 'question' : 'questions' }}.
          </p>
          <p class="mt-1 text-gray-600">Are you sure you want to submit now?</p>
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="emit('cancel')"
          >
            Review first
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl bg-[#4285f4] text-white hover:bg-[#4866DA] shadow"
            @click="emit('confirm')"
          >
            Submit anyway
          </button>
        </div>
      </div>
    </div>
</template>
