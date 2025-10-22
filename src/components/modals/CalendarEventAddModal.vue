<script setup lang="ts">
import { Teleport } from 'vue'
import type { CalendarEventItem, CalendarEventType } from '../../interfaces/interfaces'

const props = defineProps<{
  open: boolean
  formTitle: string
  formDate: string
  formTime: string
  formType: CalendarEventType
  formIsDeadline: boolean
  selectedDateEvents: CalendarEventItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'update:formTitle', value: string): void
  (e: 'update:formDate', value: string): void
  (e: 'update:formTime', value: string): void
  (e: 'update:formType', value: CalendarEventType): void
  (e: 'update:formIsDeadline', value: boolean): void
  (e: 'openEdit', ev: CalendarEventItem): void
  (e: 'quickDelete', id: number): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-blue-800">Add New Event</h3>
          <button @click="emit('close')" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="selectedDateEvents.length" class="mb-4">
          <div class="text-sm font-medium text-gray-700 mb-2">Events on {{ props.formDate }}:</div>
          <ul class="space-y-1">
            <li v-for="ev in selectedDateEvents" :key="'sel-' + ev.id" class="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded">
              <span class="truncate">{{ ev.title }}<span v-if="ev.time"> ({{ ev.time }})</span></span>
              <div class="space-x-2">
                <button class="text-blue-600 hover:underline" @click="emit('openEdit', ev)">Edit</button>
                <button class="text-red-600 hover:underline" @click="emit('quickDelete', ev.id)">Delete</button>
              </div>
            </li>
          </ul>
        </div>

        <form @submit.prevent="emit('submit')">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="event-title">Event Title</label>
            <input :value="props.formTitle" @input="emit('update:formTitle', ($event.target as HTMLInputElement).value)" type="text" id="event-title" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Date</label>
            <input :value="props.formDate" @input="emit('update:formDate', ($event.target as HTMLInputElement).value)" type="date" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="event-time">Time (optional)</label>
            <input :value="props.formTime" @input="emit('update:formTime', ($event.target as HTMLInputElement).value)" type="time" id="event-time" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="event-type">Event Type</label>
            <select :value="props.formType" @change="emit('update:formType', ($event.target as HTMLSelectElement).value as CalendarEventType)" id="event-type" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="quiz">Quiz</option>
              <option value="holiday">Holiday</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="flex items-center">
              <input :checked="props.formIsDeadline" @change="emit('update:formIsDeadline', ($event.target as HTMLInputElement).checked)" type="checkbox" class="rounded text-blue-500 focus:ring-blue-300">
              <span class="ml-2 text-gray-700">Is this a deadline?</span>
            </label>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save Event</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
