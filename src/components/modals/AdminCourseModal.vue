<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  isEditing: boolean
  modelValue: any
  errors: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:modelValue', value: any): void
}>()

const onInput = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div class="w-full max-w-lg max-h-[75vh] overflow-hidden bg-white rounded-lg shadow-lg flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b">
          <h3 class="text-lg font-semibold">{{ isEditing ? 'Edit Course' : 'New Course' }}</h3>
          <button @click="emit('close')" class="text-gray-500 hover:text-gray-700"><X class="w-5 h-5" /></button>
        </div>
        <div class="px-6 py-4 overflow-y-auto">
          <p v-if="errors._form" class="mb-3 text-sm text-red-600">{{ errors._form }}</p>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input :value="modelValue.title" @input="onInput('title', ($event.target as HTMLInputElement).value)" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              <p v-if="errors.title" class="mt-1 text-xs text-red-600">{{ errors.title }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <div class="mt-2 flex items-center gap-6">
                <label class="inline-flex items-center text-sm text-gray-700">
                  <input type="radio" value="Active" :checked="modelValue.status === 'Active'" @change="onInput('status', 'Active')" class="text-blue-600" />
                  <span class="ml-2">Active</span>
                </label>
                <label class="inline-flex items-center text-sm text-gray-700">
                  <input type="radio" value="Archived" :checked="modelValue.status === 'Archived'" @change="onInput('status', 'Archived')" class="text-blue-600" />
                  <span class="ml-2">Archived</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Subject Code</label>
              <input :value="modelValue.subjectCode" @input="onInput('subjectCode', ($event.target as HTMLInputElement).value)" type="text" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              <p v-if="errors.subjectCode" class="mt-1 text-xs text-red-600">{{ errors.subjectCode }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Units</label>
              <input :value="modelValue.units" @input="onInput('units', Number(($event.target as HTMLInputElement).value))" type="number" min="0" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              <p v-if="errors.units" class="mt-1 text-xs text-red-600">{{ errors.units }}</p>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea :value="modelValue.description" @input="onInput('description', ($event.target as HTMLTextAreaElement).value)" rows="3" class="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button @click="emit('save')" :disabled="Object.keys(errors).length > 0" :class="['px-4 py-2 text-sm font-medium text-white rounded-md', Object.keys(errors).length > 0 ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700']">Save</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
