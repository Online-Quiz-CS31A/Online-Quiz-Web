<script setup lang="ts">
import { CheckCircle, XCircle, AlertCircle } from 'lucide-vue-next'
import { BIOMETRIC_ERROR_CODES } from '@/interfaces/interfaces'

const props = defineProps<{
  success: boolean
  message?: string
  errorCode?: string | null
}>()

const errorDescription = (() => {
  if (!props.errorCode) return props.message || 'Operation failed'
  return BIOMETRIC_ERROR_CODES[props.errorCode] || props.message || 'Operation failed'
})()
</script>

<template>
  <div :class="[
    'flex flex-col items-center justify-center py-8 px-4 rounded-lg',
    success ? 'bg-green-50' : 'bg-red-50'
  ]">
    <component
      :is="success ? CheckCircle : (errorCode ? AlertCircle : XCircle)"
      :class="[
        'w-16 h-16',
        success ? 'text-green-500' : 'text-red-500'
      ]"
    />
    <p :class="[
      'mt-3 text-base font-semibold',
      success ? 'text-green-800' : 'text-red-800'
    ]">
      {{ success ? 'Success!' : 'Unable to Complete' }}
    </p>
    <p :class="[
      'mt-1 text-sm text-center',
      success ? 'text-green-600' : 'text-red-600'
    ]">
      {{ success ? message : errorDescription }}
    </p>
    <p v-if="errorCode" class="mt-2 text-xs text-red-400">
      Error code: {{ errorCode }}
    </p>
  </div>
</template>