<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBiometricStore } from '@/stores/biometricStore'
import BiometricDeviceStatus from '@/components/biometric/BiometricDeviceStatus.vue'
import BiometricScanPrompt from '@/components/biometric/BiometricScanPrompt.vue'
import BiometricResultDisplay from '@/components/biometric/BiometricResultDisplay.vue'
import StudentSearchSelect from '@/components/biometric/StudentSearchSelect.vue'
import EnrolledStudentsTable from '@/components/biometric/EnrolledStudentsTable.vue'
import { Fingerprint, RefreshCw, XCircle, AlertTriangle, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const store = useBiometricStore()

const selectedStudent = ref<{ id: number; userId: number; name: string; email: string; avatar?: string } | null>(null)
const showUnenrollConfirm = ref(false)
const unenrollTargetId = ref<number | null>(null)
const unenrollTargetName = ref('')

const isOperationActive = computed(() => {
  return store.enrollmentState === 'loading' || store.enrollmentState === 'waiting-for-scan'
})

const canStartEnrollment = computed(() => {
  return (
    store.isConnected &&
    store.deviceStatus === 'Idle' &&
    !isOperationActive.value &&
    selectedStudent.value !== null
  )
})

const selectedStudentEnrolled = computed(() => {
  if (!selectedStudent.value) return false
  const status = store.enrollmentStatuses.get(selectedStudent.value.userId)
  return status?.isEnrolled ?? false
})

const enrolledStudents = computed(() => {
  return store.students
    .filter((s) => {
      const status = store.enrollmentStatuses.get(s.userId ?? s.id)
      return status?.isEnrolled
    })
    .map((s) => ({
      ...s,
      enrollmentStatus: store.enrollmentStatuses.get(s.userId ?? s.id),
    }))
})

const enrollmentPhaseLabel = computed(() => {
  switch (store.enrollmentState) {
    case 'idle': return 'Ready'
    case 'loading': return 'Preparing...'
    case 'waiting-for-scan': return 'Scanning'
    case 'success': return 'Saved'
    case 'failed': return 'Failed'
    default: return 'Ready'
  }
})

function handleStartEnrollment() {
  if (!selectedStudent.value || !canStartEnrollment.value) return
  store.startEnrollment(
    selectedStudent.value.userId ?? selectedStudent.value.id,
    selectedStudent.value.name,
    selectedStudent.value.email
  )
}

function handleCancel() {
  store.cancelOperation()
}

function handleUnenroll(userId: number) {
  const student = store.students.find(
    (s) => (s.userId ?? s.id) === userId
  )
  unenrollTargetId.value = userId
  unenrollTargetName.value = student?.name || `User #${userId}`
  showUnenrollConfirm.value = true
}

async function confirmUnenroll() {
  if (unenrollTargetId.value !== null) {
    await store.unenrollUser(unenrollTargetId.value)
    showUnenrollConfirm.value = false
    unenrollTargetId.value = null
    unenrollTargetName.value = ''
    await store.refreshEnrollmentStatuses()
  }
}

function cancelUnenroll() {
  showUnenrollConfirm.value = false
  unenrollTargetId.value = null
  unenrollTargetName.value = ''
}

async function refreshData() {
  await store.fetchDeviceStatus()
  await store.refreshEnrollmentStatuses()
}

function goBack() {
  router.back()
}

onMounted(async () => {
  await store.initBiometric()
  await store.fetchStudents()
  await refreshData()
})

onUnmounted(() => {
  store.disposeBiometric()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Back Button -->
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer mb-4"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back</span>
        </button>
        
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-4">
            <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
              <Fingerprint class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
                Biometric Enrollment Station
              </h1>
              <p class="mt-1 text-sm sm:text-base text-blue-100">
                Enroll and manage student fingerprints for identity verification
              </p>
            </div>
          </div>
          <button
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200 cursor-pointer self-start sm:self-auto"
            @click="refreshData"
          >
            <RefreshCw class="w-4 h-4" />
            <span class="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Connection Warning -->
      <div
        v-if="store.connectionState === 'disconnected'"
        class="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-sm"
      >
        <AlertTriangle class="w-5 h-5 text-red-500 flex-shrink-0" />
        <div class="flex-1">
          <p class="text-sm font-semibold text-red-800">Unable to connect to fingerprint scanner</p>
          <p class="text-xs text-red-600 mt-1">
            Please check that the scanner is powered on and connected. Fingerprint enrollment won't work until the connection is restored.
          </p>
        </div>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          @click="store.initBiometric()"
        >
          Try Again
        </button>
      </div>

      <!-- Device Status -->
      <div class="mb-6">
        <BiometricDeviceStatus />
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 gap-6">
        <!-- Enrollment Controls -->
        <div class="space-y-6">
          <!-- Enrollment Card -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div class="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 class="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Fingerprint class="w-5 h-5 text-blue-600" />
                Save Fingerprint
              </h2>
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto',
                  store.enrollmentState === 'idle' ? 'bg-gray-100 text-gray-700' :
                  store.enrollmentState === 'loading' ? 'bg-blue-100 text-blue-700' :
                  store.enrollmentState === 'waiting-for-scan' ? 'bg-yellow-100 text-yellow-700' :
                  store.enrollmentState === 'success' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                ]"
              >
                {{ enrollmentPhaseLabel }}
              </span>
            </div>

            <div class="p-4 sm:p-6 space-y-4">
              <!-- Phase: Idle -->
              <div v-if="store.enrollmentState === 'idle'" class="space-y-4">
                <StudentSearchSelect
                  v-model="selectedStudent"
                  :students="store.students"
                  :disabled="isOperationActive"
                />

                <div v-if="selectedStudent && selectedStudentEnrolled" class="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                  <AlertTriangle class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p class="text-sm text-yellow-800">
                    This student already has a fingerprint saved. Remove it first if you need to enroll a new one.
                  </p>
                </div>

                <button
                  :disabled="!canStartEnrollment || selectedStudentEnrolled"
                  class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                  @click="handleStartEnrollment"
                >
                  <Fingerprint class="w-5 h-5" />
                  Start Fingerprint Enrollment
                </button>
              </div>

              <!-- Phase: Loading -->
              <div v-else-if="store.enrollmentState === 'loading'" class="flex flex-col items-center py-8 sm:py-12">
                <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
                <p class="text-base font-medium text-gray-700">Preparing fingerprint scanner...</p>
                <p class="text-sm text-gray-500 mt-2">
                  For: <span class="font-semibold">{{ store.enrollmentTargetUser?.name }}</span>
                </p>
                <button
                  class="mt-6 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  @click="handleCancel"
                >
                  Cancel
                </button>
              </div>

              <!-- Phase: Waiting for Scan -->
              <div v-else-if="store.enrollmentState === 'waiting-for-scan'" class="space-y-4">
                <BiometricScanPrompt
                  message="Please place your finger on the scanner"
                />
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <p class="text-sm text-gray-700">
                    Enrolling: <span class="font-semibold text-blue-700">{{ store.enrollmentTargetUser?.name }}</span>
                  </p>
                </div>
                <button
                  class="w-full px-4 py-3 text-sm font-semibold text-red-600 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                  @click="handleCancel"
                >
                  <XCircle class="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
              </div>

              <!-- Phase: Success -->
              <div v-else-if="store.enrollmentState === 'success'" class="space-y-4">
                <BiometricResultDisplay
                  :success="true"
                  :message="`Fingerprint saved successfully!`"
                />
                <button
                  class="w-full px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  @click="store.resetEnrollmentState(); selectedStudent = null; refreshData()"
                >
                  Enroll Another Student
                </button>
              </div>

              <!-- Phase: Failed -->
              <div v-else-if="store.enrollmentState === 'failed'" class="space-y-4">
                <BiometricResultDisplay
                  :success="false"
                  :message="store.enrollmentError || 'Unable to save fingerprint. Please try again.'"
                  :error-code="store.enrollmentErrorCode"
                />
                <div class="flex flex-col sm:flex-row gap-3">
                  <button
                    class="flex-1 px-4 py-3 text-sm font-semibold text-blue-600 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    @click="handleStartEnrollment"
                  >
                    Try Again
                  </button>
                  <button
                    class="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    @click="store.resetEnrollmentState(); selectedStudent = null"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <!-- Device Offline Notice -->
              <div v-if="!store.isConnected && store.enrollmentState === 'idle'" class="flex items-start gap-3 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
                <AlertTriangle class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p class="text-sm text-yellow-800">
                  The fingerprint scanner is currently offline. Please check the connection and try again.
                </p>
              </div>
            </div>
          </div>

          <!-- Enrolled Students Table -->
          <EnrolledStudentsTable
            :students="enrolledStudents"
            :is-loading="store.isLoadingStudents"
            @unenroll="handleUnenroll"
          />

          <!-- Quick Info -->
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow duration-200">
            <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Quick Guide
            </h3>
            <ol class="space-y-3 text-sm text-gray-600">
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <span>Select a student from the dropdown</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <span>Click <strong>Start Enrollment</strong> to begin</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <span>Ask the student to place their finger on the scanner</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <span>Wait for the enrollment result</span>
              </li>
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                <span>To remove a fingerprint, click <strong>Unenroll</strong> in the table</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <!-- Unenroll Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showUnenrollConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        @click.self="cancelUnenroll"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle class="w-6 h-6 text-red-600" />
              </div>
              <h3 class="text-xl font-semibold text-gray-900">Remove Fingerprint?</h3>
            </div>
            <p class="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to remove the saved fingerprint for
              <strong class="text-gray-900">{{ unenrollTargetName }}</strong>?
              They will need to enroll again to use fingerprint verification.
            </p>
            <div class="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <button
                class="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                @click="cancelUnenroll"
              >
                Cancel
              </button>
              <button
                class="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer shadow-sm hover:shadow-md"
                @click="confirmUnenroll"
              >
                Remove Fingerprint
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>