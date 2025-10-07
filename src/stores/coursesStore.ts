import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassItem } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useSectionsStore } from './sectionsStore'

export const useCoursesStore = defineStore('classes', () => {
  const allCourses = ref<ClassItem[]>([
    { id: 1, code: 'CS401', name: 'Information Assurance',  teacher: 'Donald Francisco', description: 'This course covers the principles of information security, risk management, cryptography, and security policies to protect information systems against threats and vulnerabilities.', students: 0, color: 'red',    studentUsernames: ['0212345678'] },
    { id: 2, code: 'CS301', name: 'Automata',               teacher: 'Donald Francisco', description: 'Deep dive into automata theory.', students: 0, color: 'blue',   studentUsernames: ['0212345678'] },
    { id: 3, code: 'CS302', name: 'Computer Architecture',  teacher: 'Donald Francisco', description: 'Pipelines, caches, and performance optimization.', students: 0, color: 'green',  studentUsernames: ['0212345678'] },
    { id: 4, code: 'CS303', name: 'Operating Systems',      teacher: 'Donald Francisco', description: 'This course covers the principles of operating systems, including process management, memory management, file systems, and device drivers.', students: 0, color: 'teal',   studentUsernames: [] },
    { id: 5, code: 'IT201', name: 'Web Development',        teacher: 'Alice Mao',   description: 'This course covers the principles of web development, including HTML, CSS, JavaScript, and web frameworks.', students: 0, color: 'purple', studentUsernames: ['0212345678'] },
    { id: 6, code: 'CS201', name: 'Data Structures',        teacher: 'Alice Mao',   description: 'This course covers the principles of data structures, including arrays, linked lists, stacks, queues, and trees.', students: 0, color: 'orange', studentUsernames: ['0212345678'] },
    { id: 7, code: 'IT301', name: 'Database Systems',       teacher: 'Gojo Satoru',      description: 'This course covers the principles of database systems, including database design, SQL, and NoSQL databases.', students: 0, color: 'pink',   studentUsernames: [] },
  ])
  
  const allCoursesWithCounts = computed<ClassItem[]>(() => {
    const sectionsStore = useSectionsStore()
    return allCourses.value.map(course => {
      const sections = sectionsStore.getSectionsByCourse(course.id)
      const studentCount = sections.reduce((total, section) => total + section.studentUsernames.length, 0)
      return {
        ...course,
        students: studentCount
      }
    })
  })

  const auth = useAuthStore()
  const myClasses = computed<ClassItem[]>(() => {
    const user = auth.currentUser
    if (!user) return []
    if (user.role === 'teacher') {
      return allCoursesWithCounts.value.filter(c => c.teacher === (user?.name || ''))
    } else {
      const uname = user.username
      return allCoursesWithCounts.value.filter(c => (c.studentUsernames || []).includes(uname))
    }
  })

  function addClass(newClass: Omit<ClassItem, 'id'>) {
    const last = allCourses.value.length ? allCourses.value[allCourses.value.length - 1] : undefined
    const nextId = ((last?.id) || 0) + 1
    allCourses.value.push({ id: nextId, ...newClass })
  }

  return {
    allCourses: allCoursesWithCounts,
    myClasses,
    addClass,
  }
})
