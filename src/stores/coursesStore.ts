import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassItem, TeacherCourseDto } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useSectionsStore } from './sectionsStore'
import api from '../services/api'

export const useCoursesStore = defineStore('classes', () => {
  const teacherNames: Record<string, string> = {
    '0112345678': 'Donald Francisco',
    '0111111111': 'Alice Mao',
  }

  const allCourses = ref<ClassItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  async function fetchTeacherCourses() {
    const auth = useAuthStore()
    const user = auth.currentUser

    if (!user || user.role !== 'teacher' || !user.id) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<TeacherCourseDto[]>(`/Course/teacher/${user.id}`)
      const dtoCourses = response.data || []

      for (const course of dtoCourses) {
        try {
          const enrollResponse = await api.get<any[]>(`/Course/${course.courseId}/enrollments?teacherId=${user.id}`)
          course.students = (enrollResponse.data && Array.isArray(enrollResponse.data)) ? enrollResponse.data.length : 0
        } catch (e) {
          console.error(`Failed to fetch enrollments for course ${course.courseId}`, e)
          course.students = 0
        }
      }

      const sectionsStore = useSectionsStore()
      sectionsStore.setSectionsFromApi(dtoCourses)

      const grouped = new Map<string, TeacherCourseDto[]>()
      dtoCourses.forEach(c => {
        if (!c.code) return
        if (!grouped.has(c.code)) grouped.set(c.code, [])
        grouped.get(c.code)!.push(c)
      })

      const mapped: ClassItem[] = []
      for (const [code, items] of grouped) {
        const first = items[0]

        const totalStudents = items.reduce((sum, item) => sum + (item.students || 0), 0)

        mapped.push({
          id: first.courseId,
          code: first.code,
          name: first.name,
          teacher: user.username,
          description: first.category || '',
          students: totalStudents,
          color: 'blue',
          status: (first.status === 'Active' || first.status === 'Archived') ? first.status : 'Active',
          studentUsernames: [],
        })
      }

      allCourses.value = mapped
      saveCoursesToStorage()
    } catch (e: any) {
      console.error('Failed to fetch teacher courses from API:', e)
      error.value = e?.message || 'Failed to load courses'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStudentCourses() {
    const auth = useAuthStore()
    const user = auth.currentUser

    if (!user || user.role !== 'student' || !user.id) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<any[]>(`/Course/student/${user.id}`)
      const courses = response.data || []

      const mapped: ClassItem[] = courses.map(c => ({
        id: c.courseId,
        code: c.code,
        name: c.name,
        teacher: c.instructorName || c.instructorUsername || 'Teacher',
        description: c.category || '',
        students: 0,
        color: 'blue',
        status: (c.status === 'Active' || c.status === 'Archived') ? c.status : 'Active',
        studentUsernames: []
      }))

      allCourses.value = mapped
      saveCoursesToStorage()
    } catch (e: any) {
      console.error('Failed to fetch student courses from API:', e)
      error.value = e?.message || 'Failed to load courses'
    } finally {
      isLoading.value = false
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
      return allCoursesWithCounts.value.filter(c => c.status !== 'Archived')
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
    isLoading,
    error,
    myClasses,
    mySubjects,
    addClass,
    archiveCourse,
    unarchiveCourse,
    fetchTeacherCourses,
    fetchStudentCourses,
  }
})
