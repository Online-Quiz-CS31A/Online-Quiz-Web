import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CalendarEventItem } from './types'
import { useAuthStore } from './authStore'

export const useCalendarStore = defineStore('calendar', () => {
  const calendarEventsByUser = ref<Record<string, CalendarEventItem[]>>({
    '0112345678': [
      { id: 1, title: 'Quiz 1 Due', date: todayISOWithDayOffset(10), type: 'quiz', isDeadline: true },
      { id: 2, title: 'Automata Quiz 3 Due', date: todayISOWithDayOffset(15), type: 'quiz', isDeadline: true },
      { id: 3, title: 'Faculty Meeting', date: todayISOWithDayOffset(7), type: 'other', time: '14:00' },
      { id: 4, title: 'Osmeña Day', date: fixedMonthHolidayISO(9, 9), type: 'holiday' },
    ],
    '0212345678': [
      { id: 1, title: 'IA Week 1 Quiz', date: todayISOWithDayOffset(10), type: 'quiz', isDeadline: true },
      { id: 2, title: 'Web Dev Assignment 2', date: todayISOWithDayOffset(12), type: 'other', time: '23:59', isDeadline: true },
      { id: 3, title: 'Study Group', date: todayISOWithDayOffset(6), type: 'other', time: '18:00' },
      { id: 4, title: 'School Holiday', date: fixedMonthHolidayISO(9, 30), type: 'holiday' },
    ],
  })

  const auth = useAuthStore()
  const myCalendarEvents = computed<CalendarEventItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    return calendarEventsByUser.value[uname] || []
  })

  function addCalendarEvent(evt: Omit<CalendarEventItem, 'id'>) {
    const uname = auth.currentUser?.username
    if (!uname) return
    const list = calendarEventsByUser.value[uname] || (calendarEventsByUser.value[uname] = [])
    const last = list.length ? list[list.length - 1] : undefined
    const nextId = ((last?.id) || 0) + 1
    list.push({ id: nextId, ...evt })
  }

  function todayISOWithDayOffset(offset: number): string {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  function fixedMonthHolidayISO(month: number, day: number): string {
    const d = new Date()
    const y = d.getFullYear()
    const iso = new Date(y, month - 1, day).toISOString()
    return iso.split('T')[0]
  }

  return {
    myCalendarEvents,
    addCalendarEvent,
  }
})
