import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  BiometricMode,
  BiometricOperationState,
  EnrollmentStatus,
  BiometricLogEntry,
  BiometricLogFilter,
  EnrollmentPayload,
  VerificationPayload,
  DeviceStatusChangedPayload,
} from '../interfaces/interfaces'
import * as signalrService from '../services/signalrService'
import * as biometricService from '../services/biometricService'
import { useToast } from '../composables/useToast'

interface StudentItem {
  id: number
  userId: number
  name: string
  email: string
  avatar: string
}

interface ApiUserResponse {
  userId: number
  fullName?: string
  firstName?: string
  lastName?: string
  email: string
  avatar?: string
  photoUrl?: string
}

interface UnenrollResult {
  success: boolean
  message: string
}

interface CancelResult {
  success: boolean
  message: string
}

export const useBiometricStore = defineStore('biometric', () => {
  const toast = useToast()

  // Connection state
  const connectionState = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')

  // Device state
  const deviceStatus = ref<BiometricMode>('Idle')
  const isConnected = ref(false)
  const lastActivity = ref<string | null>(null)
  const activeUserId = ref<number | null>(null)
  const activeUserName = ref<string | null>(null)

  // Enrollment state
  const enrollmentState = ref<BiometricOperationState>('idle')
  const enrollmentTargetUser = ref<{ id: number; name: string; email: string } | null>(null)
  const enrollmentSlotId = ref<number | null>(null)
  const enrollmentError = ref<string | null>(null)
  const enrollmentErrorCode = ref<string | null>(null)

  // Verification state
  const verificationState = ref<BiometricOperationState>('idle')
  const verificationTargetUserId = ref<number | null>(null)
  const verificationMatched = ref<boolean | null>(null)
  const verificationQuizId = ref<number | null>(null)
  const verificationError = ref<string | null>(null)
  const verificationErrorCode = ref<string | null>(null)

  // Admin data
  const enrollmentStatuses = ref<Map<number, EnrollmentStatus>>(new Map())
  const biometricLogs = ref<BiometricLogEntry[]>([])
  const logsPagination = ref({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  })

  // Students data for enrollment
  const students = ref<StudentItem[]>([])
  const isLoadingStudents = ref(false)

  let initialized = false

  // SignalR event handlers
  function handleEnrollmentStarted(data: EnrollmentPayload) {
    // Only handle if this is for the user we're enrolling
    if (enrollmentTargetUser.value && data.userId === enrollmentTargetUser.value.id) {
      enrollmentState.value = 'waiting-for-scan'
      enrollmentSlotId.value = data.slotId ?? null
      enrollmentError.value = null
      enrollmentErrorCode.value = null
      toast.info('Please place your finger on the scanner')
    }
  }

  function handleEnrollmentCompleted(data: EnrollmentPayload) {
    // Only handle if this is for the user we're enrolling
    if (enrollmentTargetUser.value && data.userId === enrollmentTargetUser.value.id) {
      if (data.success) {
        enrollmentState.value = 'success'
        enrollmentSlotId.value = data.slotId ?? null
        enrollmentError.value = null
        enrollmentErrorCode.value = null
        toast.success('Fingerprint saved successfully!')
        refreshEnrollmentStatuses()
      } else {
        enrollmentState.value = 'failed'
        enrollmentError.value = data.message || 'Unable to save fingerprint. Please try again.'
        enrollmentErrorCode.value = data.errorCode ?? null
        toast.error(data.message || 'Unable to save fingerprint')
      }
    }
  }

  function handleEnrollmentFailed(data: EnrollmentPayload) {
    // Only handle if this is for the user we're enrolling
    if (enrollmentTargetUser.value && data.userId === enrollmentTargetUser.value.id) {
      enrollmentState.value = 'failed'
      enrollmentError.value = data.message || 'Unable to save fingerprint. Please try again.'
      enrollmentErrorCode.value = data.errorCode ?? null
      toast.error(data.message || 'Unable to save fingerprint')
    }
  }

  function handleVerificationStarted(_data: VerificationPayload) {
    console.log('[BiometricStore] VerificationStarted event received:', _data, 'Expected userId:', verificationTargetUserId.value)
    // Only handle if this is for the user we're verifying
    if (verificationTargetUserId.value && _data.userId === verificationTargetUserId.value) {
      verificationState.value = 'waiting-for-scan'
      verificationError.value = null
      verificationErrorCode.value = null
      toast.info('Please place your finger on the scanner')
    } else {
      console.log('[BiometricStore] VerificationStarted event ignored - userId mismatch')
    }
  }

  function handleVerificationCompleted(data: VerificationPayload) {
    console.log('[BiometricStore] VerificationCompleted event received:', data, 'Expected userId:', verificationTargetUserId.value)
    // Only handle if this is for the user we're verifying
    if (verificationTargetUserId.value && data.userId === verificationTargetUserId.value) {
      if (data.success && data.matched) {
        verificationState.value = 'success'
        verificationMatched.value = true
        verificationError.value = null
        verificationErrorCode.value = null
        toast.success('Identity verified successfully!')
      } else {
        verificationState.value = 'failed'
        verificationMatched.value = false
        verificationError.value = data.message || 'Unable to verify identity. Please try again.'
        verificationErrorCode.value = data.errorCode ?? null
        toast.error(data.message || 'Unable to verify identity')
      }
    } else {
      console.log('[BiometricStore] VerificationCompleted event ignored - userId mismatch')
    }
  }

  function handleVerificationFailed(data: VerificationPayload) {
    console.log('[BiometricStore] VerificationFailed event received:', data, 'Expected userId:', verificationTargetUserId.value)
    // Only handle if this is for the user we're verifying
    if (verificationTargetUserId.value && data.userId === verificationTargetUserId.value) {
      verificationState.value = 'failed'
      verificationMatched.value = false
      verificationError.value = data.message || 'Unable to verify identity. Please try again.'
      verificationErrorCode.value = data.errorCode ?? null
      toast.error(data.message || 'Unable to verify identity')
    } else {
      console.log('[BiometricStore] VerificationFailed event ignored - userId mismatch')
    }
  }

  function handleDeviceStatusChanged(data: DeviceStatusChangedPayload) {
    deviceStatus.value = data.status as BiometricMode
    isConnected.value = data.status !== 'Disconnected'
    if (data.timestamp) {
      lastActivity.value = data.timestamp
    }
  }

  function handleOperationCancelled(_data: unknown) {
    void _data
    enrollmentState.value = 'idle'
    enrollmentTargetUser.value = null
    enrollmentSlotId.value = null
    enrollmentError.value = null
    enrollmentErrorCode.value = null
    verificationState.value = 'idle'
    verificationTargetUserId.value = null
    verificationMatched.value = null
    verificationQuizId.value = null
    verificationError.value = null
    verificationErrorCode.value = null
    toast.info('Operation cancelled')
  }

  function handleError(data: { message: string }) {
    const message: string = data.message || 'Something went wrong. Please try again.'
    toast.error(message)
    if (enrollmentState.value === 'loading' || enrollmentState.value === 'waiting-for-scan') {
      enrollmentState.value = 'failed'
      enrollmentError.value = message
    }
    if (verificationState.value === 'loading' || verificationState.value === 'waiting-for-scan') {
      verificationState.value = 'failed'
      verificationError.value = message
    }
  }

  // Initialize SignalR + event subscriptions
  async function initBiometric() {
    if (initialized) return
    initialized = true

    // Subscribe to events
    signalrService.on('EnrollmentStarted', handleEnrollmentStarted as (...args: unknown[]) => void)
    signalrService.on('EnrollmentCompleted', handleEnrollmentCompleted as (...args: unknown[]) => void)
    signalrService.on('EnrollmentFailed', handleEnrollmentFailed as (...args: unknown[]) => void)
    signalrService.on('VerificationStarted', handleVerificationStarted as (...args: unknown[]) => void)
    signalrService.on('VerificationCompleted', handleVerificationCompleted as (...args: unknown[]) => void)
    signalrService.on('VerificationFailed', handleVerificationFailed as (...args: unknown[]) => void)
    signalrService.on('DeviceStatusChanged', handleDeviceStatusChanged as (...args: unknown[]) => void)
    signalrService.on('OperationCancelled', handleOperationCancelled as (...args: unknown[]) => void)
    signalrService.on('Error', handleError as (...args: unknown[]) => void)

    try {
      connectionState.value = 'connecting'
      await signalrService.startConnection()
      connectionState.value = 'connected'
      await fetchDeviceStatus()
    } catch (error: unknown) {
      connectionState.value = 'disconnected'
      console.error('Failed to connect to biometric hub:', error)
      toast.error('Unable to connect to fingerprint scanner')
    }
  }

  async function disposeBiometric() {
    if (!initialized) return
    initialized = false

    signalrService.off('EnrollmentStarted', handleEnrollmentStarted as (...args: unknown[]) => void)
    signalrService.off('EnrollmentCompleted', handleEnrollmentCompleted as (...args: unknown[]) => void)
    signalrService.off('EnrollmentFailed', handleEnrollmentFailed as (...args: unknown[]) => void)
    signalrService.off('VerificationStarted', handleVerificationStarted as (...args: unknown[]) => void)
    signalrService.off('VerificationCompleted', handleVerificationCompleted as (...args: unknown[]) => void)
    signalrService.off('VerificationFailed', handleVerificationFailed as (...args: unknown[]) => void)
    signalrService.off('DeviceStatusChanged', handleDeviceStatusChanged as (...args: unknown[]) => void)
    signalrService.off('OperationCancelled', handleOperationCancelled as (...args: unknown[]) => void)
    signalrService.off('Error', handleError as (...args: unknown[]) => void)

    await signalrService.stopConnection()
    connectionState.value = 'disconnected'
  }

  // Enrollment actions
  async function startEnrollment(userId: number, userName: string, userEmail: string) {
    enrollmentState.value = 'loading'
    enrollmentTargetUser.value = { id: userId, name: userName, email: userEmail }
    enrollmentSlotId.value = null
    enrollmentError.value = null
    enrollmentErrorCode.value = null

    try {
      await signalrService.requestEnrollment(userId)
    } catch (error: unknown) {
      enrollmentState.value = 'failed'
      const message = error instanceof Error ? error.message : 'Unable to start enrollment. Please try again.'
      enrollmentError.value = message
      toast.error(message)
    }
  }

  // Verification actions
  async function startVerification(userId: number, quizId?: number) {
    verificationState.value = 'loading'
    verificationTargetUserId.value = userId
    verificationMatched.value = null
    verificationQuizId.value = quizId ?? null
    verificationError.value = null
    verificationErrorCode.value = null

    try {
      await signalrService.requestVerification(userId, quizId)
    } catch (error: unknown) {
      verificationState.value = 'failed'
      const message = error instanceof Error ? error.message : 'Unable to start verification. Please try again.'
      verificationError.value = message
      toast.error(message)
    }
  }

  // Cancel operation
  async function cancelOperation(): Promise<CancelResult> {
    try {
      await signalrService.cancelOperation()
      return { success: true, message: 'Operation cancelled' }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unable to cancel operation'
      toast.error(message)
      return { success: false, message }
    }
  }

  // REST-based actions
  async function fetchDeviceStatus() {
    try {
      const status = await biometricService.getDeviceStatus()
      deviceStatus.value = status.currentMode
      isConnected.value = status.isConnected
      lastActivity.value = status.lastActivity
      activeUserId.value = status.activeUserId
      activeUserName.value = status.activeUserName
    } catch (error: unknown) {
      console.error('Failed to fetch device status:', error)
    }
  }

  async function fetchEnrollmentStatus(userId: number): Promise<EnrollmentStatus | null> {
    try {
      const result = await biometricService.isUserEnrolled(userId)
      const newMap = new Map(enrollmentStatuses.value)
      newMap.set(userId, result)
      enrollmentStatuses.value = newMap
      return result
    } catch (error: unknown) {
      console.error('Failed to fetch enrollment status:', error)
      return null
    }
  }

  async function fetchBiometricLogs(filter?: BiometricLogFilter) {
    try {
      const result = await biometricService.getBiometricLogs(filter)
      biometricLogs.value = result.data
      logsPagination.value = result.pagination
    } catch (error: unknown) {
      console.error('Failed to fetch biometric logs:', error)
    }
  }

  async function unenrollUser(userId: number): Promise<UnenrollResult> {
    try {
      const result = await biometricService.unenrollFingerprint(userId)
      if (result.success) {
        toast.success('Fingerprint removed successfully')
        const newMap = new Map(enrollmentStatuses.value)
        newMap.delete(userId)
        enrollmentStatuses.value = newMap
      } else {
        toast.error(result.message || 'Unable to remove fingerprint')
      }
      return result
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } }
      const message = axiosError?.response?.data?.message || 'Unable to remove fingerprint'
      toast.error(message)
      return { success: false, message }
    }
  }

  async function refreshEnrollmentStatuses() {
    if (!students.value.length) return
    const newMap = new Map(enrollmentStatuses.value)
    for (const student of students.value) {
      try {
        const status = await biometricService.isUserEnrolled(student.userId ?? student.id)
        newMap.set(student.userId ?? student.id, status)
      } catch {
        // skip failed individual lookups
      }
    }
    enrollmentStatuses.value = newMap
  }

  async function fetchStudents() {
    isLoadingStudents.value = true
    try {
      const api = (await import('../services/api')).default
      const response = await api.get('/user/paged?pageNumber=1&pageSize=10000&role=Student')
      const items: ApiUserResponse[] = response.data.items || response.data || []
      students.value = items.map((u: ApiUserResponse) => ({
        id: u.userId,
        userId: u.userId,
        name: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        avatar: u.avatar || u.photoUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
      }))
    } catch (error: unknown) {
      console.error('Failed to fetch students:', error)
    } finally {
      isLoadingStudents.value = false
    }
  }

  function resetEnrollmentState() {
    enrollmentState.value = 'idle'
    enrollmentTargetUser.value = null
    enrollmentSlotId.value = null
    enrollmentError.value = null
    enrollmentErrorCode.value = null
  }

  function resetVerificationState() {
    verificationState.value = 'idle'
    verificationTargetUserId.value = null
    verificationMatched.value = null
    verificationQuizId.value = null
    verificationError.value = null
    verificationErrorCode.value = null
  }

  return {
    // Connection
    connectionState,
    // Device
    deviceStatus,
    isConnected,
    lastActivity,
    activeUserId,
    activeUserName,
    // Enrollment
    enrollmentState,
    enrollmentTargetUser,
    enrollmentSlotId,
    enrollmentError,
    enrollmentErrorCode,
    // Verification
    verificationState,
    verificationTargetUserId,
    verificationMatched,
    verificationQuizId,
    verificationError,
    verificationErrorCode,
    // Admin data
    enrollmentStatuses,
    biometricLogs,
    logsPagination,
    // Students data
    students,
    isLoadingStudents,
    // Actions
    initBiometric,
    disposeBiometric,
    startEnrollment,
    startVerification,
    cancelOperation,
    fetchDeviceStatus,
    fetchEnrollmentStatus,
    fetchBiometricLogs,
    unenrollUser,
    refreshEnrollmentStatuses,
    fetchStudents,
    resetEnrollmentState,
    resetVerificationState,
  }
})