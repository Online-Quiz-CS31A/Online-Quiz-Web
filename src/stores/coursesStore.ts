import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassItem, TeacherCourseDto } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useSectionsStore } from './sectionsStore'
import * as courseService from '../services/courseService'
import type { StudentCourseDto } from '../services/types'

export const useCoursesStore = defineStore('classes', () => {
  // State
  const rawTeacherCourses = ref<TeacherCourseDto[]>([])
  const allCourses = ref<ClassItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Helper function (placeholder for future implementation)
  function saveCoursesToStorage() {}

  /**
   * Fetch teacher courses from API
   * Retrieves courses, enrollments, and processes sections
   */
  async function fetchTeacherCourses() {
    const auth = useAuthStore()
    const user = auth.currentUser

    if (!user || user.role !== 'teacher' || !user.id) {
      return
    }

    const hasExisting = rawTeacherCourses.value.length > 0
    if (hasExisting) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Fetch teacher courses from service
      const dtoCourses = await courseService.getTeacherCourses(user.id)

      const sectionsStore = useSectionsStore()
      await sectionsStore.fetchSectionsFromApi()

      // Fetch enrollments for each course
      const enrollmentResults = await Promise.all(dtoCourses.map(async (course) => {
        try {
          const enrollments = await courseService.getCourseEnrollments(course.courseId, user.id!)
          return { courseId: course.courseId, enrollments }
        } catch (e) {
          console.error(`Failed to fetch enrollments for course ${course.courseId}`, e)
          return { courseId: course.courseId, enrollments: [] }
        }
      }))

      // Process enrollments and update sections
      for (const res of enrollmentResults) {
        const course = dtoCourses.find(c => c.courseId === res.courseId)
        if (!course) continue

        const enrollments = res.enrollments

        if (enrollments && Array.isArray(enrollments)) {
          course.students = enrollments.length

          const uniqueSections = new Set<string>()

          if (course.section && typeof course.section === 'string') {
            uniqueSections.add(course.section.trim())
          }

          enrollments.forEach(e => {
            const sec = e.section || e.studentSection || e.courseSection
            if (sec && typeof sec === 'string') {
              uniqueSections.add(sec.trim())
            }
          })

          uniqueSections.forEach(secName => {
            const existingSec = sectionsStore.allSections.find(s => s.name === secName)
            if (existingSec) {
              sectionsStore.addSectionToCourse(existingSec.id, course.courseId)
            } else {
              const newId = secName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
              sectionsStore.allSections.push({
                id: newId,
                name: secName,
                students: 0,
                studentUsernames: []
              })
              sectionsStore.addSectionToCourse(newId, course.courseId)
            }
          })

        } else {
          course.students = 0
        }
      }

      rawTeacherCourses.value = dtoCourses

      // Group courses by code
      const grouped = new Map<string, TeacherCourseDto[]>()
      dtoCourses.forEach(c => {
        if (!c.code) return
        if (!grouped.has(c.code)) grouped.set(c.code, [])
        grouped.get(c.code)!.push(c)
      })

      // Map to ClassItem format
      const mapped: ClassItem[] = []
      for (const [, items] of grouped) {
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
    } catch (e: unknown) {
      console.error('Failed to fetch teacher courses from API:', e)
      error.value = e instanceof Error ? e.message : 'Failed to load courses'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch student courses from API
   */
  async function fetchStudentCourses() {
    const auth = useAuthStore()
    const user = auth.currentUser

    if (!user || user.role !== 'student' || !user.id) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Fetch student courses from service
      const courses: StudentCourseDto[] = await courseService.getStudentCourses(user.id)

      const mapped: ClassItem[] = courses.map(c => ({
        id: c.courseId,
        code: c.code,
        name: c.name,
        teacher: c.instructorName || c.instructorUsername || 'Teacher',
        description: c.category || '',
        students: c.enrollmentCount ?? 0,
        color: 'blue',
        status: (c.status === 'Active' || c.status === 'Archived') ? c.status : 'Active',
        studentUsernames: []
      }))

      allCourses.value = mapped
      saveCoursesToStorage()
    } catch (e: unknown) {
      console.error('Failed to fetch student courses from API:', e)
      error.value = e instanceof Error ? e.message : 'Failed to load courses'
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties
  const allCoursesWithCounts = computed<ClassItem[]>(() => {
    const sectionsStore = useSectionsStore()
    return allCourses.value.map(course => {
      const sections = sectionsStore.getSectionsByCourse(course.id)
      const studentCount = sections.reduce((total, section) => total + section.studentUsernames.length, 0)
      return {
        ...course,
        teacher: course.teacher,
        students: sections.length > 0 ? studentCount : course.students,
      }
    })
  })

  const auth = useAuthStore()

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
            teacher: course.teacher,
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

  // Actions
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
    // State
    allCourses: allCoursesWithCounts,
    isLoading,
    error,
    rawTeacherCourses,

    // Computed
    myClasses,
    mySubjects,

    // Actions
    addClass,
    archiveCourse,
    unarchiveCourse,
    fetchTeacherCourses,
    fetchStudentCourses,
  }
})
