import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassItem } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useSectionsStore } from './sectionsStore'

export const useCoursesStore = defineStore('classes', () => {
  const teacherNames: Record<string, string> = {
    '0112345678': 'Donald Francisco',
    '0111111111': 'Alice Mao',
  }

  const allCourses = ref<ClassItem[]>([
    { id: 1, code: 'CS401', name: 'Information Assurance',  teacher: '0112345678', description: 'This course covers the principles of information security, risk management, cryptography, and security policies to protect information systems against threats and vulnerabilities.', students: 0, color: 'red',    studentUsernames: ['0212345678'], status: 'Active' },
    { id: 2, code: 'CS301', name: 'Automata',               teacher: '0112345678', description: 'Deep dive into automata theory.', students: 0, color: 'blue',   studentUsernames: ['0212345678'], status: 'Active' },
    { id: 3, code: 'CS302', name: 'Computer Architecture',  teacher: '0112345678', description: 'Pipelines, caches, and performance optimization.', students: 0, color: 'green',  studentUsernames: ['0212345678'], status: 'Active' },
    { id: 4, code: 'CS303', name: 'Operating Systems',      teacher: '0112345678', description: 'This course covers the principles of operating systems, including process management, memory management, file systems, and device drivers.', students: 0, color: 'teal',   studentUsernames: [], status: 'Archived' },
    { id: 5, code: 'IT201', name: 'Web Development',        teacher: '0111111111', description: 'This course covers the principles of web development, including HTML, CSS, JavaScript, and web frameworks.', students: 0, color: 'purple', studentUsernames: ['0212345678'], status: 'Active' },
    { id: 6, code: 'CS201', name: 'Data Structures',        teacher: '0111111111', description: 'This course covers the principles of data structures, including arrays, linked lists, stacks, queues, and trees.', students: 0, color: 'orange', studentUsernames: ['0212345678'], status: 'Active' },
    { id: 7, code: 'IT301', name: 'Database Systems',       teacher: '0112345678', description: 'This course covers the principles of database systems, including database design, SQL, and NoSQL databases.', students: 0, color: 'pink',   studentUsernames: [], status: 'Archived' },
  ])

  function loadCoursesFromStorage() {
    try {
      const stored = localStorage.getItem('courses')
      if (stored) {
        const parsed = JSON.parse(stored) as ClassItem[]
        if (Array.isArray(parsed) && parsed.length) {
          allCourses.value = parsed
        }
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage:', e)
    }
  }

  function saveCoursesToStorage() {
    try {
      localStorage.setItem('courses', JSON.stringify(allCourses.value))
    } catch (e) {
      console.error('Failed to save courses to localStorage:', e)
    }
  }
  
  const allCoursesWithCounts = computed<ClassItem[]>(() => {
    const sectionsStore = useSectionsStore()
    return allCourses.value.map(course => {
      const sections = sectionsStore.getSectionsByCourse(course.id)
      const studentCount = sections.reduce((total, section) => total + section.studentUsernames.length, 0)
      return {
        ...course,
        teacher: teacherNames[course.teacher] || course.teacher,
        students: studentCount,
      }
    })
  })

  const auth = useAuthStore()

  loadCoursesFromStorage()
  const myClasses = computed<ClassItem[]>(() => {
    const user = auth.currentUser
    if (!user) return []
    if (user.role === 'teacher') {
      const sectionsStore = useSectionsStore()
      return allCourses.value
        .filter(c => c.teacher === (user?.username || '') && c.status !== 'Archived')
        .map(course => {
          const sections = sectionsStore.getSectionsByCourse(course.id)
          const studentCount = sections.reduce((total, section) => total + section.studentUsernames.length, 0)
          return {
            ...course,
            teacher: teacherNames[course.teacher] || course.teacher,
            students: studentCount,
          }
        })
    } else {
      const uname = user.username
      return allCoursesWithCounts.value.filter(c => (c.studentUsernames || []).includes(uname) && c.status !== 'Archived')
    }
  })

  const mySubjects = computed<string[]>(() => {
    const user = auth.currentUser
    if (!user || user.role !== 'teacher') return []

    const subjects = new Set<string>()
    allCourses.value.forEach(course => {
      if (course.teacher === (user.username || '') && course.status !== 'Archived') {
        subjects.add(course.name)
      }
    })

    return Array.from(subjects)
  })

  function addClass(newClass: Omit<ClassItem, 'id'>) {
    const last = allCourses.value.length ? allCourses.value[allCourses.value.length - 1] : undefined
    const nextId = ((last?.id) || 0) + 1
    allCourses.value.push({ id: nextId, ...newClass })
    saveCoursesToStorage()
  }

  function unarchiveCourse(courseId: number) {
    allCourses.value = allCourses.value.map(course =>
      course.id === courseId
        ? { ...course, status: 'Active' }
        : course
    )
    saveCoursesToStorage()
  }

  function archiveCourse(courseId: number) {
    allCourses.value = allCourses.value.map(course =>
      course.id === courseId
        ? { ...course, status: 'Archived' }
        : course
    )
    saveCoursesToStorage()
  }

  return {
    allCourses: allCoursesWithCounts,
    myClasses,
    mySubjects,
    addClass,
    archiveCourse,
    unarchiveCourse,
  }
})
