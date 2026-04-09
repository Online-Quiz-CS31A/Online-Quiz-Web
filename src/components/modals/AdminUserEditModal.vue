<script setup lang="ts">

import { computed } from 'vue'
import { X, Mail, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{ 
  open: boolean,
  modelValue: any,
  originalRole: string,
  errors: Record<string, string>,
  departments: string[],
  years: string[],
  courses: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:modelValue', value: any): void
  (e: 'role-change'): void
}>()

const onInput = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const roleChanged = computed(() => 
  props.originalRole && props.modelValue.role && props.originalRole !== props.modelValue.role
)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div class="w-full max-w-lg max-h-[80vh] overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h3 class="text-lg font-semibold">Edit User</h3>
          <button @click="emit('close')" class="text-gray-500 hover:text-gray-700"><X class="w-5 h-5" /></button>
        </div>
        <div class="px-6 py-4 overflow-y-auto">
          <p v-if="errors._form" class="mb-3 text-sm text-red-600">{{ errors._form }}</p>

          <!-- Role change warning banner -->
          <div
            v-if="roleChanged"
            class="flex items-start gap-2 p-3 mb-4 rounded-md bg-blue-50 border border-blue-300"
          >
            <AlertTriangle class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div class="text-xs text-blue-800">
              <strong>Role change detected:</strong> Changing from
              <span class="font-semibold">{{ originalRole }}</span> to
              <span class="font-semibold">{{ modelValue.role }}</span>.
              The user will need to log in again to apply the new role permissions.
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Full Name</label>
              <input :value="modelValue.fullName" @input="onInput('fullName', ($event.target as HTMLInputElement).value)" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Full name" />
              <p v-if="errors.fullName" class="mt-1 text-xs text-red-600">{{ errors.fullName }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Email (Gmail only)</label>
              <input :value="modelValue.email" @input="onInput('email', ($event.target as HTMLInputElement).value)" type="email" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="username@gmail.com" />
              <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Contact Number</label>
              <input :value="modelValue.contactNumber" @input="onInput('contactNumber', ($event.target as HTMLInputElement).value)" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="+63 912 345 6789" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <input :value="modelValue.emergencyContactNumber" @input="onInput('emergencyContactNumber', ($event.target as HTMLInputElement).value)" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Optional" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Role</label>
              <select
                :value="modelValue.role"
                @change="onInput('role', ($event.target as HTMLSelectElement).value); emit('role-change')"
                :class="[
                  'block w-full px-3 py-2 mt-1 bg-white border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
                  roleChanged ? 'border-orange-400 ring-1 ring-orange-300' : 'border-gray-300'
                ]"
              >
                <option>Student</option>
                <option>Teacher</option>
                <option>Administrator</option>
              </select>
              <p v-if="errors.role" class="mt-1 text-xs text-red-600">{{ errors.role }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select :value="modelValue.status" @change="onInput('status', ($event.target as HTMLSelectElement).value)" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <option>Active</option>
                <option>Inactive</option>
                <option>Archived</option>
              </select>
              <p v-if="errors.status" class="mt-1 text-xs text-red-600">{{ errors.status }}</p>
            </div>

            <!-- Archive reason -->
            <div v-if="modelValue.status === 'Archived'" class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Archive Reason</label>
              <select
                :value="modelValue.archiveReason || 'Account inactivity'"
                @change="onInput('archiveReason', ($event.target as HTMLSelectElement).value)"
                class="block w-full px-3 py-2 mt-1 bg-amber-50 border border-amber-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              >
                <option value="" disabled>Select a reason...</option>
                <option>Graduated</option>
                <option>Transferred to another institution</option>
                <option>Dropped out</option>
                <option>Account inactivity</option>
                <option>Violation of policies</option>
                <option>Duplicate account</option>
                <option>Other</option>
              </select>
              <p v-if="errors.archiveReason" class="mt-1 text-xs text-red-600">{{ errors.archiveReason }}</p>
            </div>

            <!-- Password info notice -->
            <div class="sm:col-span-2">
              <div class="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200">
                <Mail class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p class="text-xs text-amber-700">The user's password is hidden for security. The password was sent to the user's email upon account creation.</p>
              </div>
            </div>

            <template v-if="modelValue.role === 'Student'">
              <div>
                <label class="block text-sm font-medium text-gray-700">Course</label>
                <select :value="modelValue.course" @change="onInput('course', ($event.target as HTMLSelectElement).value)" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">Select Course</option>
                  <option v-for="course in courses" :key="course" :value="course">{{ course }}</option>
                </select>
                <p v-if="errors.course" class="mt-1 text-xs text-red-600">{{ errors.course }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Year</label>
                <select :value="modelValue.year" @change="onInput('year', ($event.target as HTMLSelectElement).value)" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">Select Year</option>
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
                <p v-if="errors.year" class="mt-1 text-xs text-red-600">{{ errors.year }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Section</label>
                <input :value="modelValue.section" @input="onInput('section', ($event.target as HTMLInputElement).value)" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none sm:text-sm" />
                <p v-if="errors.section" class="mt-1 text-xs text-red-600">{{ errors.section }}</p>
              </div>
            </template>

            <template v-else-if="modelValue.role === 'Teacher'">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700">Department</label>
                <select :value="modelValue.department" @change="onInput('department', ($event.target as HTMLSelectElement).value)" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option value="">Select Department</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                </select>
                <p v-if="errors.department" class="mt-1 text-xs text-red-600">{{ errors.department }}</p>
              </div>
            </template>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button
            @click="emit('save')"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
