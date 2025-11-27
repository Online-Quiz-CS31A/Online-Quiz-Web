<script setup lang="ts">
import { defineProps } from 'vue'
import { ref, computed, watch } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
}>()

const stage = ref<'warn' | 'verify'>('warn')
const inputText = ref('')
const isVerify = computed(() => stage.value === 'verify')
const isValid = computed(() => inputText.value.trim().toLowerCase() === 'delete')

watch(() => props.open, (v) => {
  if (v) {
    stage.value = 'warn'
    inputText.value = ''
  }
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle class="h-7 w-7 text-red-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900" v-if="!isVerify">
          {{ title || 'Are you sure?' }}
        </h3>
        <p class="mt-2 text-gray-600" v-if="!isVerify">
          {{ message || 'This action cannot be undone.' }}
        </p>
        <h3 class="text-xl font-semibold text-gray-900" v-else>
          Confirm deletion
        </h3>
        <p class="mt-2 text-gray-600" v-else>
          Please type <span class="font-semibold">DELETE</span> to confirm. This cannot be undone.
        </p>
      </div>
      <div v-if="isVerify" class="mt-5 text-left">
        <input
          v-model="inputText"
          type="text"
          placeholder="Type DELETE"
          class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-200"
        />
      </div>
      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
          @click="() => { stage = 'warn'; inputText = ''; $emit('cancel') }"
        >
          {{ isVerify ? 'Back' : (cancelLabel || 'Cancel') }}
        </button>
        <button
          v-if="!isVerify"
          type="button"
          class="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow"
          @click="() => { stage = 'verify' }"
        >
          {{ confirmLabel || 'Delete everything' }}
        </button>
        <button
          v-else
          type="button"
          class="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
          :disabled="!isValid"
          @click="$emit('confirm')"
        >
          Confirm delete
        </button>
      </div>
    </div>
  </div>
</template>
