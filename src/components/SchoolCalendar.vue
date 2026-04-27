<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import { useCalendarStore } from '@/stores/calendarStore'
import SearchFilterBar from '@/components/SearchFilterBar.vue'
import type { CalendarEventType, CalendarEventItem } from '../interfaces/interfaces'
import CalendarEventAddModal from '@/components/modals/CalendarEventAddModal.vue'
import CalendarEventEditModal from '@/components/modals/CalendarEventEditModal.vue'

// REFS
const now = ref(new Date())
const currentMonth = ref(now.value.getMonth())
const currentYear = ref(now.value.getFullYear())
const currentTimeString = ref('')
const showModal = ref(false)
const formTitle = ref('')
const formDate = ref<string>('')
const formTime = ref<string>('')
const formType = ref<CalendarEventType>('quiz')
const formIsDeadline = ref(false)
const editingEventId = ref<number | null>(null)
const readOnlyMode = ref(false)
const { error: showError } = useToast()
const searchQuery = ref('')
const eventFilter = ref<'all' | 'quiz' | 'holiday' | 'other'>('all')

// REACTIVE
const calendarStore = useCalendarStore()
const events = computed<CalendarEventItem[]>(() => calendarStore.myCalendarEvents)

// COMPUTED
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

// METHODS
function isDateInPast(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return target < today
}

function isEventInPast(ev: CalendarEventItem) {
  const [y, m, d] = ev.date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  if (ev.time) {
    const [hh, mm] = ev.time.split(':').map(Number)
    dt.setHours(hh || 0, mm || 0, 0, 0)
    return dt.getTime() < Date.now()
  }
  dt.setHours(23, 59, 59, 999)
  return dt.getTime() < Date.now()
}
function eventsForDate(dateStr: string) {
  const q = searchQuery.value.trim().toLowerCase()
  return events.value
    .filter(e => e.date === dateStr)
    .filter(e => (eventFilter.value === 'all' ? true : e.type === eventFilter.value))
    .filter(e => (q ? (e.title || '').toLowerCase().includes(q) : true))
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
  if (isDateInPast(dateStr)) {
    showError("You can't add events in the past")
    return
  }
  readOnlyMode.value = false
  openModal(dateStr)
}

function openEdit(ev: CalendarEventItem) {
  readOnlyMode.value = isEventInPast(ev)
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

// LIFECYCLE
onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})
</script>

<template>
  <div class="min-h-screen">
    <div class="container mx-auto px-4 py-6 max-w-7xl">
      <!-- AppHeader Section -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-1">School Calendar</h1>
            <p class="text-sm text-gray-600 flex items-center">
              <i class="fas fa-clock mr-2 text-blue-600"></i>
              {{ currentTimeString }}
            </p>
          </div>
        </div>

        <!-- Search and Filter Bar -->
        <SearchFilterBar
          :model-value="searchQuery"
          :filter="eventFilter"
          :options="[
            { label: 'All Events', value: 'all' },
            { label: 'Quizzes', value: 'quiz' },
            { label: 'Holidays', value: 'holiday' },
            { label: 'Other', value: 'other' }
          ]"
          placeholder="Search events by title..."
          action-label="Add Event"
          @update:modelValue="(v: string) => (searchQuery = v)"
          @update:filter="(v: string) => (eventFilter = v as 'all' | 'quiz' | 'holiday' | 'other')"
          @action="openModal()"
        />
      </div>

      <!-- Calendar Card -->
      <div class="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <!-- Calendar AppHeader -->
        <div class="flex items-center justify-between px-6 py-4 bg-white">
        <button
          @click="prevMonth"
          class="p-2 rounded-lg bg-white/10 text-blue-500 transition-all duration-200 hover:scale-110 cursor-pointer"
          aria-label="Previous month"
        >
          <i class="fas fa-chevron-left text-lg"></i>
        </button>
        <h2 class="text-2xl font-bold text-blue-500 tracking-wide">{{ monthYearLabel }}</h2>
        <button
          @click="nextMonth"
          class="p-2 rounded-lg bg-white/10 text-blue-500 transition-all duration-200 hover:scale-110 cursor-pointer"
          aria-label="Next month"
        >
          <i class="fas fa-chevron-right text-lg"></i>
        </button>
      </div>

      <!-- Weekday AppHeaders -->
      <div class="grid grid-cols-7 gap-px bg-gray-100">
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Sun</div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Mon</div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Tue</div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Wed</div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Thu</div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Fri</div>
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 py-3 text-center font-semibold text-blue-900 text-sm uppercase tracking-wider">Sat</div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7 gap-px bg-gray-100">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="bg-white min-h-28 p-3 relative cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:shadow-md group"
          :class="{
            'bg-gray-50/50 text-gray-400': !cell.inCurrentMonth,
            'bg-blue-50/30': isToday(cell.date) && cell.inCurrentMonth
          }"
          @click="openAddForDate(cell.date)"
        >
          <div class="flex items-center justify-between mb-2">
            <span
              class="font-semibold inline-flex items-center justify-center text-sm transition-all"
              :class="[
                !cell.inCurrentMonth ? 'text-gray-400' : 'text-gray-700',
                isToday(cell.date) ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full w-8 h-8 shadow-lg ring-2 ring-blue-200' : ''
              ]"
            >
              {{ cell.dayNumber }}
            </span>
            <i v-if="cell.inCurrentMonth && !isDateInPast(cell.date)" class="fas fa-plus text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
          </div>

          <div v-if="eventsForDate(cell.date).length" class="space-y-1.5">
            <div
              v-for="ev in eventsForDate(cell.date)"
              :key="ev.id"
              class="text-xs px-2 py-1.5 rounded-lg truncate cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md font-medium"
              :class="[
                ev.type === 'quiz' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300 border border-red-300' :
                ev.type === 'holiday' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300 border border-purple-300' :
                ev.type === 'other' ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300 border border-amber-300' :
                'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 hover:from-blue-200 hover:to-blue-300 border border-blue-300',
                ev.isDeadline ? 'ring-2 ring-offset-1 ring-red-400' : ''
              ]"
              @click.stop="openEdit(ev)"
            >
              <div class="flex items-center gap-1">
                <i v-if="ev.isDeadline" class="fas fa-exclamation-circle text-xs"></i>
                <span class="truncate">{{ ev.title }}</span>
              </div>
              <span v-if="ev.time" class="text-[10px] opacity-75 block mt-0.5">
                <i class="far fa-clock mr-1"></i>{{ ev.time }}
              </span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

    <!-- Modals -->
    <CalendarEventAddModal
      v-if="showModal && editingEventId === null"
      :open="showModal"
      :form-title="formTitle"
      :form-date="formDate"
      :form-time="formTime"
      :form-type="formType"
      :form-is-deadline="formIsDeadline"
      :selected-date-events="selectedDateEvents"
      @close="closeModal"
      @submit="onSubmit"
      @update:form-title="(val: string) => (formTitle = val)"
      @update:form-date="(val: string) => (formDate = val)"
      @update:form-time="(val: string) => (formTime = val)"
      @update:form-type="(val: CalendarEventType) => (formType = val)"
      @update:form-is-deadline="(val: boolean) => (formIsDeadline = val)"
      @openEdit="openEdit"
      @quickDelete="(id: number) => { editingEventId = id; onDelete() }"
    />

    <CalendarEventEditModal
      v-if="showModal && editingEventId !== null"
      :open="showModal"
      :form-title="formTitle"
      :form-date="formDate"
      :form-time="formTime"
      :form-type="formType"
      :form-is-deadline="formIsDeadline"
      :read-only="readOnlyMode"
      @close="closeModal"
      @submit="onSubmit"
      @delete="onDelete"
      @update:form-title="val => (formTitle = val)"
      @update:form-date="val => (formDate = val)"
      @update:form-time="val => (formTime = val)"
      @update:form-type="val => (formType = val)"
      @update:form-is-deadline="val => (formIsDeadline = val)"
    />
  </div>
</template>



