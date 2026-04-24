import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassItem, TeacherCourseDto } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'
import { useSectionsStore } from './sectionsStore'
import api from '../services/api'

export const useCoursesStore = defineStore('classes', () => {


  const rawTeacherCourses = ref<TeacherCourseDto[]>([])
  const allCourses = ref<ClassItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)


  function saveCoursesToStorage() {}

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
      const response = await api.get<TeacherCourseDto[]>(`/Course/teacher/${user.id}`)
      const dtoCourses = response.data || []
      
      const sectionsStore = useSectionsStore()
      
      await sectionsStore.fetchSectionsFromApi()
      
      const enrollmentResults = await Promise.all(dtoCourses.map(async (course) => {
        try {
          const enrollResponse = await api.get<any[]>(`/Course/${course.courseId}/enrollments?teacherId=${user.id}`)
          return { courseId: course.courseId, enrollments: enrollResponse.data }
        } catch (e) {
          console.error(`Failed to fetch enrollments for course ${course.courseId}`, e)
          return { courseId: course.courseId, enrollments: [] }
        }
      }))

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
        teacher: course.teacher,
        students: studentCount,
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
    rawTeacherCourses,
    addClass,
    archiveCourse,
    unarchiveCourse,
    fetchTeacherCourses,
    fetchStudentCourses,
  }
})
