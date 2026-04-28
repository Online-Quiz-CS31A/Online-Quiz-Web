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

  // Helper function to save courses to localStorage
  function saveCoursesToStorage() {
    try {
      const auth = useAuthStore()
      const user = auth.currentUser
      if (!user) return

      const sectionsStore = useSectionsStore()
      const storageKey = `courses_v3_${user.role}_${user.id}`
      const data = {
        allCourses: allCourses.value,
        rawTeacherCourses: rawTeacherCourses.value,
        allSections: sectionsStore.allSections,
        courseSectionMappings: sectionsStore.courseSectionMappings,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to save courses to localStorage:', e)
    }
  }

  function loadCoursesFromStorage() {
    try {
      const auth = useAuthStore()
      const user = auth.currentUser
      if (!user) return false

      const storageKey = `courses_v2_${user.role}_${user.id}`
      const stored = localStorage.getItem(storageKey)
      if (!stored) return false

      const data = JSON.parse(stored)
      const isRecent = data.timestamp && (Date.now() - data.timestamp < 5 * 60 * 1000)

      if (isRecent && data.allCourses) {
        allCourses.value = data.allCourses
        if (data.rawTeacherCourses) {
          rawTeacherCourses.value = data.rawTeacherCourses
        }

        const sectionsStore = useSectionsStore()
        if (Array.isArray(data.allSections)) {
          sectionsStore.allSections = data.allSections
        }
        if (Array.isArray(data.courseSectionMappings)) {
          sectionsStore.courseSectionMappings = data.courseSectionMappings
        }
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to load courses from localStorage:', e)
      return false
    }
  }

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

    const sectionsStore = useSectionsStore()
    const hasExisting = rawTeacherCourses.value.length > 0 && sectionsStore.courseSectionMappings.length > 0
    if (hasExisting) {
      return
    }

    // Try to load from localStorage first
    const loadedFromStorage = loadCoursesFromStorage()
    if (loadedFromStorage) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Fetch teacher courses from service
      const dtoCourses = await courseService.getTeacherCourses(user.id)


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
          const uniqueStudentIds = new Set(
            enrollments
              .map((e: any) => String(e.studentId || e.userId || e.studentNumber || ''))
              .filter(Boolean)
          )
          course.students = uniqueStudentIds.size

          // Group students by section name → Map<sectionName, Set<studentId>>
          const sectionStudentsMap = new Map<string, Set<string>>()

          // Include the teacher's primary section even if no one is enrolled yet
          if (course.section && typeof course.section === 'string') {
            const sec = course.section.trim()
            if (sec && !sectionStudentsMap.has(sec)) sectionStudentsMap.set(sec, new Set())
          }

          enrollments.forEach(e => {
            const sec = (e.section || course.section)?.trim()
            if (!sec) return
            if (!sectionStudentsMap.has(sec)) sectionStudentsMap.set(sec, new Set())
            const studentKey = String(e.studentId || e.userId || e.studentNumber || '')
            if (studentKey) sectionStudentsMap.get(sec)!.add(studentKey)
          })

          sectionStudentsMap.forEach((studentSet, secName) => {
            const studentIds = Array.from(studentSet)
            const existingSec = sectionsStore.allSections.find(s => s.name === secName)
            if (existingSec) {
              const merged = new Set([...existingSec.studentUsernames, ...studentIds])
              existingSec.studentUsernames = Array.from(merged)
              existingSec.students = existingSec.studentUsernames.length
              sectionsStore.addSectionToCourse(existingSec.id, course.courseId)
            } else {
              const newId = secName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
              sectionsStore.allSections.push({
                id: newId,
                name: secName,
                students: studentIds.length,
                studentUsernames: studentIds
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

    const loadedFromStorage = loadCoursesFromStorage()
    if (loadedFromStorage) {
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

  async function unarchiveCourse(courseId: number) {
    try {
      await courseService.unarchiveCourse(courseId)
      allCourses.value = allCourses.value.map(course =>
        course.id === courseId
          ? { ...course, status: 'Active' }
          : course
      )
      saveCoursesToStorage()
      return true
    } catch (e) {
      console.error('Failed to unarchive course:', e)
      error.value = e instanceof Error ? e.message : 'Failed to unarchive course'
      return false
    }
  }

  async function archiveCourse(courseId: number) {
    try {
      await courseService.archiveCourse(courseId)
      allCourses.value = allCourses.value.map(course =>
        course.id === courseId
          ? { ...course, status: 'Archived' }
          : course
      )
      saveCoursesToStorage()
      return true
    } catch (e) {
      console.error('Failed to archive course:', e)
      error.value = e instanceof Error ? e.message : 'Failed to archive course'
      return false
    }
  }

  async function bulkArchiveCourses(courseIds: number[]) {
    try {
      const result = await courseService.bulkArchiveCourses(courseIds)
      
      if (result.successfulIds && result.successfulIds.length > 0) {
        allCourses.value = allCourses.value.map(course =>
          result.successfulIds.includes(course.id)
            ? { ...course, status: 'Archived' }
            : course
        )
        saveCoursesToStorage()
      }
      
      return result
    } catch (e) {
      console.error('Failed to bulk archive courses:', e)
      error.value = e instanceof Error ? e.message : 'Failed to bulk archive courses'
      throw e
    }
  }

  async function bulkUnarchiveCourses(courseIds: number[]) {
    try {
      const result = await courseService.bulkUnarchiveCourses(courseIds)
      
      if (result.successfulIds && result.successfulIds.length > 0) {
        allCourses.value = allCourses.value.map(course =>
          result.successfulIds.includes(course.id)
            ? { ...course, status: 'Active' }
            : course
        )
        saveCoursesToStorage()
      }
      
      return result
    } catch (e) {
      console.error('Failed to bulk unarchive courses:', e)
      error.value = e instanceof Error ? e.message : 'Failed to bulk unarchive courses'
      throw e
    }
  }

  async function fetchArchivedCourses() {
    isLoading.value = true
    error.value = null
    try {
      const archived = await courseService.getArchivedCourses()
      return archived
    } catch (e) {
      console.error('Failed to fetch archived courses:', e)
      error.value = e instanceof Error ? e.message : 'Failed to fetch archived courses'
      return []
    } finally {
      isLoading.value = false
    }
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
    bulkArchiveCourses,
    bulkUnarchiveCourses,
    fetchArchivedCourses,
    fetchTeacherCourses,
    fetchStudentCourses,
  }
})
