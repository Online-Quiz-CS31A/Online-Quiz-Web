<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useBiometricStore } from '@/stores/biometricStore'
import { useAuthStore } from '@/stores/authStore'
import BiometricScanPrompt from '@/components/biometric/BiometricScanPrompt.vue'
import BiometricResultDisplay from '@/components/biometric/BiometricResultDisplay.vue'
import { Fingerprint, XCircle, AlertTriangle, ShieldCheck, Loader } from 'lucide-vue-next'

const props = defineProps<{
  quizId: number
}>()

const emit = defineEmits<{
  verified: []
}>()

const store = useBiometricStore()
const authStore = useAuthStore()

const isEnrolled = computed(() => {
  const userId = authStore.currentUser?.id
  if (!userId) return null
  const status = store.enrollmentStatuses.get(userId)
  return status?.isEnrolled ?? null
})

const isCheckingEnrollment = computed(() => {
  return isEnrolled.value === null && store.connectionState === 'connected'
})

const canStartVerification = computed(() => {
  return (
    store.isConnected &&
    store.verificationState === 'idle' &&
    isEnrolled.value === true &&
    !isCheckingEnrollment.value
  )
})

function handleVerify() {
  const userId = authStore.currentUser?.id
  if (!userId) return
  store.startVerification(userId, props.quizId)
}

function handleCancel() {
  store.cancelOperation()
  store.resetVerificationState()
}

function handleRetry() {
  handleVerify()
}

watch(() => store.verificationState, (state) => {
  if (state === 'success') {
    emit('verified')
  }
})

onMounted(async () => {
  await store.initBiometric()
  const userId = authStore.currentUser?.id
  if (userId) {
    await store.fetchEnrollmentStatus(userId)
  }
})

onUnmounted(() => {
  store.resetVerificationState()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center gap-2 text-[#4285f4]">
      <Fingerprint class="w-5 h-5" />
      <h3 class="text-lg font-semibold">Identity Verification Required</h3>
    </div>

    <p class="text-sm text-gray-600">
      Please verify your identity with your fingerprint before starting the quiz.
    </p>

    <!-- Single Status Message -->
    <div v-if="store.connectionState === 'disconnected'" class="flex items-start gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
      <AlertTriangle class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <div class="flex-1">
        <p class="text-sm font-semibold text-red-800">Scanner Not Connected</p>
        <p class="text-sm text-red-600 mt-1">
          The fingerprint scanner is not available. Please contact your instructor for assistance.
        </p>
        <button
          class="mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
          @click="store.initBiometric()"
        >
          Try Again
        </button>
      </div>
    </div>

    <div v-else-if="isCheckingEnrollment" class="flex items-center gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
      <Loader class="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
      <span class="text-sm text-blue-700">Checking your fingerprint status...</span>
    </div>

    <div v-else-if="isEnrolled === false" class="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
      <AlertTriangle class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div>
        <p class="text-sm font-semibold text-yellow-800">Fingerprint Not Set Up</p>
        <p class="text-sm text-yellow-700 mt-1">
          You need to register your fingerprint first. Please visit your instructor to set it up.
        </p>
      </div>
    </div>

    <div v-else-if="isEnrolled === null && !isCheckingEnrollment" class="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
      <AlertTriangle class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div>
        <p class="text-sm font-semibold text-yellow-800">Cannot Verify Status</p>
        <p class="text-sm text-yellow-700 mt-1">
          Unable to check if your fingerprint is registered. Please contact your instructor.
        </p>
      </div>
    </div>

    <!-- Verification Flow (only shown if enrolled) -->
    <div v-else-if="isEnrolled === true">
      <!-- Idle State -->
      <div v-if="store.verificationState === 'idle'">
        <button
          :disabled="!canStartVerification"
          class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#4285f4] rounded-lg hover:bg-[#1976d2] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          @click="handleVerify"
        >
          <ShieldCheck class="w-5 h-5" />
          Verify My Identity
        </button>
      </div>

      <!-- Loading -->
      <div v-else-if="store.verificationState === 'loading'" class="flex flex-col items-center py-6">
        <div class="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
        <p class="text-sm font-medium text-gray-700">Connecting to scanner...</p>
        <p class="text-xs text-gray-400 mt-2">This may take a few seconds</p>
        <button
          class="mt-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          @click="handleCancel"
        >
          Cancel
        </button>
      </div>

      <!-- Waiting for Scan -->
      <div v-else-if="store.verificationState === 'waiting-for-scan'">
        <BiometricScanPrompt message="Please place your finger on the scanner" />
        <button
          class="w-full mt-3 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
          @click="handleCancel"
        >
          <XCircle class="w-4 h-4 inline mr-2" />
          Cancel
        </button>
      </div>

      <!-- Success -->
      <div v-else-if="store.verificationState === 'success'">
        <BiometricResultDisplay
          :success="true"
          message="Identity verified! You can now start the quiz."
        />
      </div>

      <!-- Failed -->
      <div v-else-if="store.verificationState === 'failed'" class="space-y-3">
        <BiometricResultDisplay
          :success="false"
          :message="store.verificationError || 'Unable to verify your identity. Please try again.'"
          :error-code="store.verificationErrorCode"
        />
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            class="flex-1 px-4 py-2 text-sm font-semibold text-[#4285f4] bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            @click="handleRetry"
          >
            Try Again
          </button>
          <button
            class="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            @click="store.resetVerificationState()"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>