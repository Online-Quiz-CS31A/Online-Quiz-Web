<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface StudentItem {
  id: number
  name: string
  email: string
  progress: number
  grade: string
  avatar: string
}

const props = defineProps<{ 
  searchTerm: string,
  students: StudentItem[],
  currentPage: number,
  totalPages: number,
}>()

const emit = defineEmits<{
  (e: 'update:searchTerm', value: string): void,
  (e: 'prev-page'): void,
  (e: 'next-page'): void,
  (e: 'remove', student: StudentItem): void,
}>()
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow border border-gray-200">
      <div class="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">Class Roster</h2>
          <p class="text-sm text-gray-500">Manage enrolled students and invite new members</p>
        </div>
        <div class="flex items-center gap-2">
          <div class="relative">
            <input :value="props.searchTerm" @input="$emit('update:searchTerm', ($event.target as HTMLInputElement).value)" type="text" placeholder="Search students..." class="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64" />
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <button class="px-3 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 cursor-pointer">Add</button>
        </div>
      </div>
      <div class="divide-y divide-gray-100">
        <div v-for="s in props.students" :key="s.id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
          <div class="flex items-center gap-3">
            <img :src="s.avatar" :alt="s.name" class="h-10 w-10 rounded-full object-cover ring-2 ring-blue-100" />
            <div>
              <div class="font-medium text-gray-900">{{ s.name }}</div>
              <div class="text-sm text-gray-500">{{ s.email }}</div>
            </div>
          </div>
          <div class="hidden md:flex items-center gap-8">
            <div class="flex items-center gap-2 w-28 justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span class="font-medium text-gray-800 whitespace-nowrap">{{ s.progress }}%</span>
            </div>
            <div class="w-40 shrink-0 grade-progress"><div class="grade-progress-fill" :style="{ width: s.progress + '%' }"></div></div>
            <span class="inline-flex items-center text-xs px-2 py-1 rounded-full" :class="s.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">Grade {{ s.grade }}</span>
            <button @click="$emit('remove', s)" class="px-3 py-1.5 border border-red-300 text-red-700 rounded-md hover:bg-red-50 cursor-pointer">Remove</button>
          </div>
        </div>
      </div>
      <div class="px-6 py-3 flex items-center justify-between bg-gray-50 border-t border-gray-200">
        <div class="text-sm text-gray-600">Page {{ props.currentPage }} of {{ props.totalPages }}</div>
        <div class="flex items-center gap-1">
          <button @click="$emit('prev-page')" class="px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">Prev</button>
          <button @click="$emit('next-page')" class="px-2 py-1 border rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.grade-progress { 
  height: 8px; 
  border-radius: 4px; 
  background-color: #e0e7ff; 
}

.grade-progress-fill { 
  height: 100%; 
  border-radius: 4px; 
  background: linear-gradient(90deg, #3b82f6, #1d4ed8); 
  transition: width 0.5s ease; 
}
</style>
