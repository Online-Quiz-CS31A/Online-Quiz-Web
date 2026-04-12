<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RotateCcw } from 'lucide-vue-next'

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

const stage = ref<'warn' | 'verify'>('warn')
const inputText = ref('')
const isVerify = computed(() => stage.value === 'verify')
const isValid = computed(() => inputText.value.trim().toLowerCase() === 'restore')

const displayTitle = computed(() => props.title || 'Unarchive item?')
const displayDescription = computed(() => {
  if (props.description) return props.description
  if (props.itemName) return `This will move "${props.itemName}" back to your active list.`
  return 'This will move the selected item back to your active list.'
})

watch(() => props.open, (v) => {
  if (v) {
    stage.value = 'warn'
    inputText.value = ''
  }
})

const handleCancel = () => {
  stage.value = 'warn'
  inputText.value = ''
  emit('cancel')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <RotateCcw class="h-7 w-7 text-emerald-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900" v-if="!isVerify">
          {{ displayTitle }}
        </h3>
        <p class="mt-2 text-gray-600" v-if="!isVerify">
          {{ displayDescription }}
        </p>

        <h3 class="text-xl font-semibold text-gray-900" v-else>
          Confirm Restore
        </h3>
        <p class="mt-2 text-gray-600" v-if="isVerify">
          Please type <span class="font-semibold text-emerald-600">RESTORE</span> to confirm.
        </p>
      </div>

      <div v-if="isVerify" class="mt-5 text-left">
        <input
          v-model="inputText"
          type="text"
          placeholder="Type RESTORE"
          class="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          @keyup.enter="isValid && emit('confirm')"
        />
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          @click="handleCancel"
        >
          {{ isVerify ? 'Back' : 'No, keep archived' }}
        </button>
        <button
          v-if="!isVerify"
          type="button"
          class="w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow transition-colors"
          @click="() => { stage = 'verify' }"
        >
          Yes, unarchive
        </button>
        <button
          v-else
          type="button"
          class="w-full px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow transition-all"
          :disabled="!isValid"
          @click="emit('confirm')"
        >
          Confirm Restore
        </button>
      </div>
    </div>
  </div>
</template>
