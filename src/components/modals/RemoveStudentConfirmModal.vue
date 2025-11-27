<script setup lang="ts">
import { defineProps, defineEmits, ref, watch, computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{ 
  open: boolean,
  name?: string
}>()

const emit = defineEmits<{ (e: 'cancel'): void; (e: 'confirm'): void }>()

const inputText = ref('')
const stage = ref<'warn' | 'verify'>('warn')
const isValid = computed(() => inputText.value.trim().toLowerCase() === 'remove')

watch(() => props.open, (v) => {
  if (v) { inputText.value = ''; stage.value = 'warn' }
})
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('cancel')"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div v-if="stage === 'warn'">
        <div class="text-center">
          <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle class="h-7 w-7 text-red-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Remove student?</h3>
          <p class="mt-2 text-gray-600">
            This will remove <span class="font-semibold">{{ name || 'this student' }}</span> from this section. This action cannot be undone.
          </p>
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="emit('cancel')"
          >
            No, keep
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow"
            @click="stage = 'verify'"
          >
            Yes, remove
          </button>
        </div>
      </div>

      <div v-else>
        <div class="text-center">
          <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle class="h-7 w-7 text-red-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">Confirm removal</h3>
          <p class="mt-2 text-gray-600">Please type <span class="font-semibold">remove</span> to confirm. This cannot be undone.</p>
        </div>
        <div class="mt-5 text-left">
          <input
            v-model="inputText"
            type="text"
            placeholder="Type remove"
            class="w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-200"
          />
        </div>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
            @click="() => { stage = 'warn'; inputText = '' }"
          >
            Back
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow"
            :disabled="!isValid"
            @click="emit('confirm')"
          >
            Yes, remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
