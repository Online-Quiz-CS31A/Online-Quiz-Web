<script setup lang="ts">
import { Trash2, CheckCircle, Clock, User } from 'lucide-vue-next'
import type { EnrollmentStatus } from '@/interfaces/interfaces'

interface StudentWithEnrollment {
  userId: number
  name: string
  email: string
  avatar?: string
  enrollmentStatus?: EnrollmentStatus | undefined
}

defineProps<{
  students: StudentWithEnrollment[]
  isLoading?: boolean
}>()

const emit = defineEmits<{
  unenroll: [userId: number]
}>()
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div class="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
      <h3 class="text-base sm:text-lg font-semibold text-gray-800">Students with Saved Fingerprints</h3>
    </div>
    <div v-if="isLoading" class="p-12 text-center text-gray-500">
      <div class="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-3" />
      <p class="text-sm font-medium">Loading enrolled students...</p>
    </div>
    <div v-else-if="students.length === 0" class="p-12 text-center text-gray-400">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <User class="w-8 h-8 opacity-50" />
      </div>
      <p class="text-sm font-medium">No fingerprints saved yet</p>
      <p class="text-xs text-gray-400 mt-1">Start enrolling students to see them here</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 text-left border-b border-gray-200">
            <th class="px-4 sm:px-6 py-3 font-semibold text-gray-700">Student</th>
            <th class="px-4 sm:px-6 py-3 font-semibold text-gray-700">Slot ID</th>
            <th class="px-4 sm:px-6 py-3 font-semibold text-gray-700">Status</th>
            <th class="px-4 sm:px-6 py-3 font-semibold text-gray-700 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in students"
            :key="student.userId"
            class="border-t border-gray-100 hover:bg-blue-50/50 transition-colors"
          >
            <td class="px-4 sm:px-6 py-4">
              <div class="flex items-center gap-3">
                <img
                  :src="student.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'"
                  :alt="student.name"
                  class="w-10 h-10 rounded-full ring-2 ring-gray-200"
                />
                <div>
                  <p class="font-semibold text-gray-900">{{ student.name }}</p>
                  <p class="text-xs text-gray-500">{{ student.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 sm:px-6 py-4 text-gray-700">
              <span v-if="student.enrollmentStatus?.isEnrolled" class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                Slot #{{ student.enrollmentStatus.slotId }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>
            <td class="px-4 sm:px-6 py-4">
              <span v-if="student.enrollmentStatus?.isEnrolled" class="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <CheckCircle class="w-4 h-4" />
                Fingerprint Saved
              </span>
              <span v-else class="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400">
                <Clock class="w-4 h-4" />
                Not Enrolled
              </span>
            </td>
            <td class="px-4 sm:px-6 py-4 text-right">
              <button
                v-if="student.enrollmentStatus?.isEnrolled"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                @click="emit('unenroll', student.userId)"
              >
                <Trash2 class="w-4 h-4" />
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>