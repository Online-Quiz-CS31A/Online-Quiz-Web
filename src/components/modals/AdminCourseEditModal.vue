<script setup lang="ts">
import { computed } from 'vue'
import { X, Plus, Trash2, User, School } from 'lucide-vue-next'
import MultiSelectDropdown from '@/components/common/MultiSelectDropdown.vue'
import type { AdminUser } from '@/interfaces/interfaces'

const props = defineProps<{
  open: boolean
  modelValue: any
  errors: Record<string, string>
  teachers: AdminUser[]
  allSections: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:modelValue', value: any): void
}>()

const onInput = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const addAssignment = () => {
  const assignments = [...(props.modelValue.assignments || [])]
  assignments.push({ instructorId: null, sections: [] })
  onInput('assignments', assignments)
}

const removeAssignment = (index: number) => {
  const assignments = [...(props.modelValue.assignments || [])]
  assignments.splice(index, 1)
  onInput('assignments', assignments)
}

const updateAssignment = (index: number, field: string, value: any) => {
  const assignments = [...(props.modelValue.assignments || [])]
  assignments[index] = { ...assignments[index], [field]: value }
  onInput('assignments', assignments)
}

const sectionOptions = computed(() => props.allSections.map(s => ({ label: s, value: s })))

const hasAssignments = computed(() => props.modelValue.assignments && props.modelValue.assignments.length > 0)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
        
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 class="text-lg font-semibold text-gray-900">Edit Course</h3>
          <button @click="emit('close')" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="max-h-[calc(90vh-140px)] overflow-y-auto">
          <div class="px-6 py-5 space-y-5">
            
            <p v-if="errors._form" class="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">{{ errors._form }}</p>
            
            <!-- Course Code & Name -->
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-800 mb-1.5">Course Code <span class="text-gray-400">(Cannot be changed)</span></label>
                <input 
                  :value="modelValue.code" 
                  type="text" 
                  disabled
                  class="block w-full px-3.5 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed select-none"
                  style="cursor: not-allowed;"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-1.5">Course Name <span class="text-red-500">*</span></label>
                <input 
                  :value="modelValue.title" 
                  @input="onInput('title', ($event.target as HTMLInputElement).value)" 
                  type="text" 
                  placeholder="e.g., Introduction to Programming" 
                  class="block w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.title }"
                />
                <p v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-1.5">Category / Department <span class="text-red-500">*</span></label>
                <input 
                  :value="modelValue.subjectCode" 
                  @input="onInput('subjectCode', ($event.target as HTMLInputElement).value)" 
                  type="text" 
                  placeholder="e.g., Computer Science" 
                  class="block w-full px-3.5 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  :class="{ 'border-red-500 focus:ring-red-500': errors.subjectCode }"
                />
                <p v-if="errors.subjectCode" class="mt-1 text-xs text-red-600">{{ errors.subjectCode }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-1.5">Status</label>
                <div class="flex items-center gap-4">
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="radio" value="Active" :checked="modelValue.status === 'Active'" @change="onInput('status', 'Active')" class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                    <span class="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                  <label class="inline-flex items-center cursor-pointer">
                    <input type="radio" value="Archived" :checked="modelValue.status === 'Archived'" @change="onInput('status', 'Archived')" class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500" />
                    <span class="ml-2 text-sm text-gray-700">Archived</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-200 pt-5">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-semibold text-gray-900">Assignments <span class="text-red-500">*</span></h4>
                <button 
                  type="button" 
                  @click="addAssignment" 
                  class="flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Plus class="w-3.5 h-3.5 mr-1" /> Add
                </button>
              </div>
              
              <div v-if="!hasAssignments" class="p-6 text-center bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                <p class="text-sm text-gray-500">Click "Add" to assign instructors</p>
              </div>

              <div v-else class="space-y-2.5">
                <div 
                  v-for="(assignment, index) in (modelValue.assignments as any[])" 
                  :key="index" 
                  class="p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div class="flex items-start gap-2">
                    <!-- Instructor -->
                    <div class="flex-1">
                      <label class="flex items-center text-xs font-medium text-gray-700 mb-1">
                        <User class="w-3.5 h-3.5 mr-1" /> Instructor
                      </label>
                      <select 
                        :value="assignment.instructorId" 
                        @change="updateAssignment(index, 'instructorId', Number(($event.target as HTMLSelectElement).value))" 
                        class="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option :value="null">Select instructor...</option>
                        <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">{{ teacher.name }}</option>
                      </select>
                    </div>

                    <!-- Sections -->
                    <div class="flex-1">
                      <label class="flex items-center text-xs font-medium text-gray-700 mb-1">
                        <School class="w-3.5 h-3.5 mr-1" /> Sections
                      </label>
                      <MultiSelectDropdown
                        :modelValue="assignment.sections || []"
                        @update:modelValue="updateAssignment(index, 'sections', $event)"
                        :options="sectionOptions"
                        placeholder="Select sections..."
                        class="w-full"
                      />
                    </div>

                    <!-- Remove -->
                    <div class="pt-5">
                      <button 
                        type="button" 
                        @click="removeAssignment(index)" 
                        class="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="errors.assignments" class="mt-2 text-xs text-red-600">{{ errors.assignments }}</p>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button 
            @click="emit('close')" 
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="emit('save')" 
            :disabled="Object.keys(errors).length > 0" 
            :class="[
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-all',
              Object.keys(errors).length > 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            ]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
