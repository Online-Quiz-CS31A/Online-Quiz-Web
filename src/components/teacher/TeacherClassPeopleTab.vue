<script setup lang="ts">
import type { StudentItem } from '@/interfaces/interfaces'

const props = defineProps<{ 
  searchTerm: string,
  students: StudentItem[],
  currentPage: number,
  totalPages: number,
  isArchived?: boolean,
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
          <button
            :disabled="props.isArchived"
            :title="props.isArchived ? `Can't edit archived` : 'Add student to this class'"
            :class="[
              'px-3 py-2 rounded-md border',
              props.isArchived
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 cursor-pointer'
            ]"
          >Add</button>
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
          <div class="hidden md:flex items-center">
            <button
              @click="!props.isArchived && $emit('remove', s)"
              :disabled="props.isArchived"
              :title="props.isArchived ? `Can't edit archived` : 'Remove student from this class'"
              :class="[
                'px-3 py-1.5 border rounded-md',
                props.isArchived
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-red-300 text-red-700 hover:bg-red-50 cursor-pointer'
              ]"
            >Remove</button>
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
