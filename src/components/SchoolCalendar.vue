<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCalendarStore } from '@/stores/calendarStore'
import type { CalendarEventType, CalendarEventItem } from '../stores/types'

const now = ref(new Date())
const currentMonth = ref(now.value.getMonth())
const currentYear = ref(now.value.getFullYear())
const currentTimeString = ref('')

const calendarStore = useCalendarStore()
const events = computed<CalendarEventItem[]>(() => calendarStore.myCalendarEvents)

const showModal = ref(false)
const formTitle = ref('')
const formDate = ref<string>('')
const formTime = ref<string>('')
const formType = ref<CalendarEventType>('quiz')
const formIsDeadline = ref(false)
const editingEventId = ref<number | null>(null)

const selectedDateEvents = computed(() =>
  formDate.value ? events.value.filter(e => e.date === formDate.value) : []
)

const monthYearLabel = computed(() =>
  new Date(currentYear.value, currentMonth.value).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
)

const calendarCells = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
  const prevMonthDays = new Date(currentYear.value, currentMonth.value, 0).getDate()

  const cells: Array<{
    dayNumber: number
    inCurrentMonth: boolean
    date: string
  }> = []

  let day = 1
  let nextMonthDay = 1

  for (let i = 0; i < 42; i++) {
    if (i < firstDay) {
      const prevDay = prevMonthDays - firstDay + i + 1
      const date = new Date(currentYear.value, currentMonth.value - 1, prevDay)
      cells.push({
        dayNumber: prevDay,
        inCurrentMonth: false,
        date: date.toISOString().split('T')[0],
      })
    } else if (day > daysInMonth) {
      const date = new Date(currentYear.value, currentMonth.value + 1, nextMonthDay)
      cells.push({
        dayNumber: nextMonthDay,
        inCurrentMonth: false,
        date: date.toISOString().split('T')[0],
      })
      nextMonthDay++
    } else {
      const date = new Date(currentYear.value, currentMonth.value, day)
      cells.push({
        dayNumber: day,
        inCurrentMonth: true,
        date: date.toISOString().split('T')[0],
      })
      day++
    }
  }
  return cells
})

function eventsForDate(dateStr: string) {
  return events.value.filter(e => e.date === dateStr)
}

function isToday(dateStr: string) {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

function prevMonth() {
  currentMonth.value--
  if (currentMonth.value < 0) {
    currentMonth.value = 11
    currentYear.value--
  }
}

function nextMonth() {
  currentMonth.value++
  if (currentMonth.value > 11) {
    currentMonth.value = 0
    currentYear.value++
  }
}

function openModal(defaultDate?: string) {
  editingEventId.value = null
  formTitle.value = ''
  formDate.value = defaultDate ?? new Date().toISOString().split('T')[0]
  formTime.value = ''
  formType.value = 'quiz'
  formIsDeadline.value = false
  showModal.value = true
}

function openAddForDate(dateStr: string) {
  openModal(dateStr)
}

function openEdit(ev: CalendarEventItem) {
  editingEventId.value = ev.id
  formTitle.value = ev.title
  formDate.value = ev.date
  formTime.value = ev.time ?? ''
  formType.value = ev.type
  formIsDeadline.value = !!ev.isDeadline
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function onSubmit() {
  if (!formTitle.value || !formDate.value) return
  if (editingEventId.value != null) {
    calendarStore.updateCalendarEvent(editingEventId.value, {
      title: formTitle.value,
      date: formDate.value,
      type: formType.value,
      isDeadline: formIsDeadline.value,
      ...(formTime.value ? { time: formTime.value } : { time: undefined }),
    })
  } else {
    calendarStore.addCalendarEvent({
      title: formTitle.value,
      date: formDate.value,
      type: formType.value,
      isDeadline: formIsDeadline.value,
      ...(formTime.value ? { time: formTime.value } : {}),
    })
  }
  closeModal()
}

function onDelete() {
  if (editingEventId.value != null) {
    calendarStore.deleteCalendarEvent(editingEventId.value)
    closeModal()
  }
}

function updateClock() {
  const t = new Date()
  const timeString = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const dateString = t.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  currentTimeString.value = `${dateString} | ${timeString}`
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="items-center mb-8">
      <div class="flex justify-between space-x-4">
        <div class="text-blue-700 font-medium">{{ currentTimeString }}</div>
        <button @click="openModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition cursor-pointer">
          <i class="fas fa-plus mr-2"></i> Add Event
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b">
        <button @click="prevMonth" class="text-blue-500 hover:text-blue-700">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2 class="text-xl font-semibold text-blue-800">{{ monthYearLabel }}</h2>
        <button @click="nextMonth" class="text-blue-500 hover:text-blue-700">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>

      <div class="grid grid-cols-7 gap-px bg-gray-200">
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Sun</div>
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Mon</div>
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Tue</div>
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Wed</div>
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Thu</div>
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Fri</div>
        <div class="bg-blue-100 py-2 text-center font-medium text-blue-800">Sat</div>
      </div>

      <div class="grid grid-cols-7 gap-px bg-gray-200">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="bg-white min-h-24 p-2 relative cursor-pointer"
          :class="{ 'bg-gray-50 text-gray-400': !cell.inCurrentMonth }"
          @click="openAddForDate(cell.date)"
        >
          <span
            class="font-medium inline-flex items-center justify-center"
            :class="[
              !cell.inCurrentMonth ? 'text-gray-400' : '',
              isToday(cell.date) ? 'bg-blue-600 text-white rounded-full w-7 h-7' : ''
            ]"
          >
            {{ cell.dayNumber }}
          </span>

          <div v-if="eventsForDate(cell.date).length" class="mt-1 space-y-1">
            <div
              v-for="ev in eventsForDate(cell.date)"
              :key="ev.id"
              class="text-xs p-1 rounded truncate cursor-pointer"
              :class="[
                ev.type === 'quiz' ? 'bg-red-100 text-red-800' :
                ev.type === 'holiday' ? 'bg-purple-100 text-purple-800' :
                ev.type === 'other' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800',
                ev.isDeadline ? 'deadline' : ''
              ]"
              @click.stop="openEdit(ev)"
            >
              {{ ev.title }}<span v-if="ev.time"> ({{ ev.time }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Add Event Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-blue-800">{{ editingEventId !== null ? 'Edit Event' : 'Add New Event' }}</h3>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="selectedDateEvents.length" class="mb-4">
          <div class="text-sm font-medium text-gray-700 mb-2">Events on {{ formDate }}:</div>
          <ul class="space-y-1">
            <li v-for="ev in selectedDateEvents" :key="'sel-' + ev.id" class="flex items-center justify-between text-sm bg-gray-50 px-2 py-1 rounded">
              <span class="truncate">{{ ev.title }}<span v-if="ev.time"> ({{ ev.time }})</span></span>
              <div class="space-x-2">
                <button class="text-blue-600 hover:underline" @click="openEdit(ev)">Edit</button>
                <button class="text-red-600 hover:underline" @click="() => { editingEventId = ev.id; onDelete() }">Delete</button>
              </div>
            </li>
          </ul>
        </div>
        <form @submit.prevent="onSubmit">
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="event-title">Event Title</label>
            <input v-model="formTitle" type="text" id="event-title" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2">Date</label>
            <!-- Replace this native input with shadcn-vue Calendar/DatePicker once installed -->
            <input v-model="formDate" type="date" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" required>
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="event-time">Time (optional)</label>
            <input v-model="formTime" type="time" id="event-time" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 mb-2" for="event-type">Event Type</label>
            <select v-model="formType" id="event-type" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option value="quiz">Quiz</option>
              <option value="holiday">Holiday</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="mb-4">
            <label class="flex items-center">
              <input v-model="formIsDeadline" type="checkbox" class="rounded text-blue-500 focus:ring-blue-300">
              <span class="ml-2 text-gray-700">Is this a deadline?</span>
            </label>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Cancel</button>
            <button v-if="editingEventId !== null" type="button" @click="onDelete" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{{ editingEventId !== null ? 'Save Changes' : 'Save Event' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


