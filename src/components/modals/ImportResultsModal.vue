<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { StudentViewModel } from '@/interfaces/interfaces'
import { X } from 'lucide-vue-next'

const props = defineProps<{ 
  show: boolean,
  added: StudentViewModel[],
  skipped: { studentNumber: string; name: string; reason: string }[]
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

function close() {
  emit('close')
}
</script>

<template>
  <div v-if="props.show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Import Results</h3>
        <button @click="close" class="p-2 rounded-md hover:bg-gray-100 text-gray-700">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-green-700">Added Students</h4>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{{ props.added.length }}</span>
          </div>
          <div v-if="props.added.length === 0" class="text-sm text-gray-500">No students added.</div>
          <ul v-else class="space-y-1">
            <li v-for="s in props.added" :key="s.username" class="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
              <div class="flex items-center gap-2">
                <img :src="s.avatar" :alt="s.name" class="w-6 h-6 rounded-full object-cover" />
                <span class="text-sm text-gray-900">{{ s.name }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ s.username }}</span>
            </li>
          </ul>
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-medium text-red-700">Skipped Students</h4>
            <span class="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">{{ props.skipped.length }}</span>
          </div>
          <div v-if="props.skipped.length === 0" class="text-sm text-gray-500">No skipped entries.</div>
          <ul v-else class="space-y-1">
            <li v-for="(s, idx) in props.skipped" :key="`${s.studentNumber}-${idx}`" class="flex items-center justify-between bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <div class="flex flex-col">
                <span class="text-sm text-gray-900">{{ s.name }}</span>
                <span class="text-xs text-gray-600">{{ s.studentNumber || 'N/A' }}</span>
              </div>
              <span class="text-xs text-red-700">{{ s.reason }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="px-6 py-4 border-t border-gray-200 flex justify-end">
        <button @click="close" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md">Done</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
