<script setup lang="ts">
import { ref, watch } from 'vue'
import { Archive } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  userName?: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm', reason: string): void
}>()

const archiveReasons = [
  'Graduated',
  'Transferred to another institution',
  'Dropped out',
  'Account inactivity',
  'Violation of policies',
  'Duplicate account',
  'Other'
]

const selectedReason = ref('')
const reasonError = ref('')

watch(() => props.open, (v) => {
  if (v) {
    selectedReason.value = 'Account inactivity'
    reasonError.value = ''
  }
})

const handleConfirm = () => {
  if (!selectedReason.value) {
    reasonError.value = 'Please select a reason for archiving.'
    return
  }
  reasonError.value = ''
  emit('confirm', selectedReason.value)
}

const handleCancel = () => {
  selectedReason.value = ''
  reasonError.value = ''
  emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9999] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="handleCancel"></div>
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div class="text-center">
          <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
            <Archive class="h-7 w-7 text-amber-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900">
            Archive User
          </h3>
          <p class="mt-2 text-gray-600">
            Are you sure you want to archive <span class="font-semibold">{{ userName || 'this user' }}</span>? The user will be moved to the archived list.
          </p>
        </div>

        <!-- Reason Dropdown -->
        <div class="mt-5 text-left">
          <label class="block text-sm font-medium text-gray-700 mb-1">Reason for archiving</label>
          <select
            v-model="selectedReason"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 sm:text-sm transition-all"
            :class="{ 'border-red-300 focus:ring-red-200 focus:border-red-400': reasonError }"
          >
            <option value="" disabled>Select a reason...</option>
            <option v-for="reason in archiveReasons" :key="reason" :value="reason">
              {{ reason }}
            </option>
          </select>
          <p v-if="reasonError" class="mt-1 text-xs text-red-600">{{ reasonError }}</p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            @click="handleCancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="w-full px-4 py-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow transition-colors"
            @click="handleConfirm"
          >
            Archive User
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
