import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassItem } from './types'
import { useAuthStore } from './authStore'

export const useClassesStore = defineStore('classes', () => {
  const allClasses = ref<ClassItem[]>([
    { id: 1, name: 'Information Assurance',  teacher: 'Donald Francisco', description: '', students: 24, color: 'red',    studentUsernames: ['0212345678'] },
    { id: 2, name: 'Automata',               teacher: 'Donald Francisco', description: '', students: 22, color: 'blue',   studentUsernames: ['0212345678'] },
    { id: 3, name: 'Computer Architecture',  teacher: 'Donald Francisco', description: '', students: 26, color: 'green',  studentUsernames: ['0212345678'] },
    { id: 4, name: 'Operating Systems',      teacher: 'Donald Francisco', description: '', students: 28, color: 'teal',   studentUsernames: [] },
    { id: 5, name: 'Web Development',        teacher: 'Angel Mangubat',   description: '', students: 30, color: 'purple', studentUsernames: ['0212345678'] },
    { id: 6, name: 'Data Structures',        teacher: 'Angel Mangubat',   description: '', students: 27, color: 'orange', studentUsernames: ['0212345678'] },
    { id: 7, name: 'Database Systems',       teacher: 'Gojo Satoru',      description: '', students: 25, color: 'pink',   studentUsernames: [] },
  ])

  const auth = useAuthStore()
  const myClasses = computed<ClassItem[]>(() => {
    const user = auth.currentUser
    if (!user) return []
    if (user.role === 'teacher') {
      return allClasses.value.filter(c => c.teacher === (user?.name || ''))
    } else {
      const uname = user.username
      return allClasses.value.filter(c => (c.studentUsernames || []).includes(uname))
    }
  })

  function addClass(newClass: Omit<ClassItem, 'id'>) {
    const last = allClasses.value.length ? allClasses.value[allClasses.value.length - 1] : undefined
    const nextId = ((last?.id) || 0) + 1
    allClasses.value.push({ id: nextId, ...newClass })
  }

  return {
    allClasses,
    myClasses,
    addClass,
  }
})
