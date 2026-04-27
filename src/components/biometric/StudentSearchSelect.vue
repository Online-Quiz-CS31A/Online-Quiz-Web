<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from 'lucide-vue-next'

interface StudentItem {
  id: number
  userId: number
  name: string
  email: string
  avatar?: string
}

const props = defineProps<{
  students: StudentItem[]
  modelValue: StudentItem | null
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [student: StudentItem | null]
}>()

const searchQuery = ref('')
const isDropdownOpen = ref(false)

const filteredStudents = computed(() => {
  if (!searchQuery.value.trim()) return props.students
  const q = searchQuery.value.toLowerCase()
  return props.students.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
  )
})

function selectStudent(student: StudentItem) {
  emit('update:modelValue', student)
  searchQuery.value = student.name
  isDropdownOpen.value = false
}

function clearSelection() {
  emit('update:modelValue', null)
  searchQuery.value = ''
  isDropdownOpen.value = false
}

function onInputBlur() {
  setTimeout(() => {
    isDropdownOpen.value = false
  }, 200)
}

watch(searchQuery, () => {
  isDropdownOpen.value = true
})
</script>

<template>
  <div class="relative">
    <label class="block text-sm font-medium text-gray-700 mb-1">
      Select Student
    </label>
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        v-model="searchQuery"
        :disabled="disabled"
        type="text"
        placeholder="Search by name or email..."
        class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
        @focus="isDropdownOpen = true"
        @blur="onInputBlur"
      />
      <button
        v-if="modelValue"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        @click="clearSelection"
      >
        &times;
      </button>
    </div>
    <div
      v-if="isDropdownOpen && filteredStudents.length > 0"
      class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
    >
      <button
        v-for="student in filteredStudents"
        :key="student.userId"
        class="flex items-center w-full px-3 py-2 text-sm hover:bg-blue-50 transition-colors cursor-pointer"
        :class="{ 'bg-blue-50': modelValue?.userId === student.userId }"
        @mousedown.prevent="selectStudent(student)"
      >
        <img
          :src="student.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'"
          :alt="student.name"
          class="w-8 h-8 rounded-full mr-3"
        />
        <div class="text-left">
          <p class="font-medium text-gray-900">{{ student.name }}</p>
          <p class="text-xs text-gray-500">{{ student.email }}</p>
        </div>
      </button>
    </div>
    <div
      v-if="isDropdownOpen && filteredStudents.length === 0"
      class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm text-gray-500"
    >
      No students found
    </div>
  </div>
</template>