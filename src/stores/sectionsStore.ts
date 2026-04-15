import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassSection, CourseSectionMapping, CourseSectionSchedule, TeacherCourseDto } from '@/interfaces/interfaces'
import { useAuthStore } from './authStore'
import api from '../services/api'

export const useSectionsStore = defineStore('sections', () => {
  const allSections = ref<ClassSection[]>([])

  const courseSectionMappings = ref<CourseSectionMapping[]>([])

  const courseSectionSchedules = ref<CourseSectionSchedule[]>([])

  const auth = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const archivedSectionMappings = ref<{ sectionId: number; courseIds: number[] }[]>([])

  function setSectionsFromApi(data: TeacherCourseDto[]) {
    try {
      const sectionMap = new Map<string, ClassSection>()
      const newMappings: CourseSectionMapping[] = []

      data.forEach(item => {
        if (!item.courseId) return
        const sectionName = item.section?.trim()
        if (!sectionName) return

        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, {
            id: item.courseId,
            name: sectionName,
            students: item.students || 0,
            studentUsernames: []
          })
        }

        const sectionEntry = sectionMap.get(sectionName)!
        const alreadyMapped = newMappings.some(
          m => m.courseId === item.courseId && m.sectionId === sectionEntry.id
        )
        if (!alreadyMapped) {
          newMappings.push({
            courseId: item.courseId,
            sectionId: sectionEntry.id
          })
        }
      })

      allSections.value = Array.from(sectionMap.values())
      courseSectionMappings.value = newMappings

      saveCourseSectionMappingsToStorage()
    } catch (e: any) {
      console.error('Failed to set sections from API data:', e)
    }
  }

  function loadCourseSectionDataFromStorage() {
    try {
      const mappingsRaw = localStorage.getItem('courseSectionMappings')
      if (mappingsRaw) {
        const parsed = JSON.parse(mappingsRaw) as CourseSectionMapping[]
        if (Array.isArray(parsed) && parsed.length) {
          courseSectionMappings.value = parsed
        }
      }
    } catch (e) {
      console.error('Failed to load course-section mappings from localStorage:', e)
    }

    try {
      const schedulesRaw = localStorage.getItem('courseSectionSchedules')
      if (schedulesRaw) {
        const parsed = JSON.parse(schedulesRaw) as CourseSectionSchedule[]
        if (Array.isArray(parsed) && parsed.length) {
          courseSectionSchedules.value = parsed
        }
      }
    } catch (e) {
      console.error('Failed to load course-section schedules from localStorage:', e)
    }
  }

  function saveCourseSectionMappingsToStorage() {
    try {
      localStorage.setItem('courseSectionMappings', JSON.stringify(courseSectionMappings.value))
    } catch (e) {
      console.error('Failed to save course-section mappings to localStorage:', e)
    }
  }

  function saveCourseSectionSchedulesToStorage() {
    try {
      localStorage.setItem('courseSectionSchedules', JSON.stringify(courseSectionSchedules.value))
    } catch (e) {
      console.error('Failed to save course-section schedules to localStorage:', e)
    }
  }

  function loadArchivedSectionsFromStorage() {
    try {
      const stored = localStorage.getItem('archivedSections')
      if (stored) {
        const parsed = JSON.parse(stored) as { sectionId: number; courseIds: number[] }[]
        if (Array.isArray(parsed)) {
          archivedSectionMappings.value = parsed
        }
      }
    } catch (e) {
      console.error('Failed to load archived sections from localStorage:', e)
      archivedSectionMappings.value = []
    }
  }

  function saveArchivedSectionsToStorage() {
    try {
      localStorage.setItem('archivedSections', JSON.stringify(archivedSectionMappings.value))
    } catch (e) {
      console.error('Failed to save archived sections to localStorage:', e)
    }
  }

  async function fetchSectionsFromApi() {
    isLoading.value = true
    error.value = null
    try {
      localStorage.removeItem('courseSectionMappings')
      localStorage.removeItem('courseSectionSchedules')
      localStorage.removeItem('archivedSections')

      allSections.value = []
      courseSectionMappings.value = []
      courseSectionSchedules.value = []

      const response = await api.get('/User')
      const allUsers = response.data || []

      const sectionMap = new Map<string, ClassSection>()
      const mappings: CourseSectionMapping[] = []

      const studentUsers = allUsers.filter((u: any) => u.roleName === 'Student')

      studentUsers.forEach((user: any) => {
        const studentData = user.student || {}
        const sectionName = studentData.section?.trim()
        if (!sectionName) return

        const sectionId = sectionName.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)

        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, {
            id: sectionId,
            name: sectionName,
            students: 0,
            studentUsernames: []
          })
        }

        const section = sectionMap.get(sectionName)!
        const studentId = studentData.studentId || user.email?.split('@')[0] || String(user.userId)

        if (!section.studentUsernames.includes(studentId)) {
          section.studentUsernames.push(studentId)
          section.students = section.studentUsernames.length
        }
      })

      allSections.value = Array.from(sectionMap.values())
      return allSections.value.length
    } catch (err: any) {
      console.error('Failed to fetch sections from API:', err)
      error.value = err.message || 'Failed to fetch sections'
      return 0
    } finally {
      isLoading.value = false
    }
  }

  function getSectionsByCourse(courseId: number): ClassSection[] {
    const sectionIds = courseSectionMappings.value
      .filter(m => m.courseId === courseId)
      .map(m => m.sectionId)

    const archivedIdsForCourse = archivedSectionMappings.value
      .filter(m => m.courseIds.includes(courseId))
      .map(m => m.sectionId)

    return allSections.value.filter(s => sectionIds.includes(s.id) && !archivedIdsForCourse.includes(s.id))
  }

  function addSection(newSection: Omit<ClassSection, 'id'>, courseId: number) {
    const lastSection = allSections.value.length ? allSections.value[allSections.value.length - 1] : undefined
    const nextId = ((lastSection?.id) || 0) + 1
    allSections.value.push({ id: nextId, ...newSection })

    courseSectionMappings.value.push({ courseId, sectionId: nextId })
    saveCourseSectionMappingsToStorage()
    return nextId
  }

  function addSectionToCourse(sectionId: number, courseId: number) {
    const exists = courseSectionMappings.value.some(
      m => m.courseId === courseId && m.sectionId === sectionId
    )
    if (exists) return

    courseSectionMappings.value.push({ courseId, sectionId })
    saveCourseSectionMappingsToStorage()

    const existingSchedule = courseSectionSchedules.value.find(
      s => s.sectionId === sectionId
    )
    if (existingSchedule) {
      const { scheduleDay, scheduleTime, classroom } = existingSchedule
      setSchedule(courseId, sectionId, { scheduleDay, scheduleTime, classroom })
    }
  }

  function updateSection(id: number, updates: Partial<ClassSection>) {
    const idx = allSections.value.findIndex(s => s.id === id)
    if (idx !== -1) {
      allSections.value[idx] = { ...allSections.value[idx], ...updates }
    }
  }

  function removeSectionFromCourse(sectionId: number, courseId: number) {
    courseSectionMappings.value = courseSectionMappings.value.filter(
      m => !(m.courseId === courseId && m.sectionId === sectionId)
    )
    saveCourseSectionMappingsToStorage()
  }

  function archiveSection(sectionId: number, courseId: number) {
    const courseIds = courseSectionMappings.value
      .filter(m => m.sectionId === sectionId)
      .map(m => m.courseId)

    const uniqueCourseIds = Array.from(new Set(courseIds.length ? courseIds : [courseId]))

    const existing = archivedSectionMappings.value.find(m => m.sectionId === sectionId)
    if (existing) {
      existing.courseIds = uniqueCourseIds
    } else {
      archivedSectionMappings.value.push({ sectionId, courseIds: uniqueCourseIds })
    }
    saveArchivedSectionsToStorage()

    courseSectionMappings.value = courseSectionMappings.value.filter(
      m => m.sectionId !== sectionId
    )
    saveCourseSectionMappingsToStorage()
  }

  function unarchiveSection(sectionId: number) {
    const entry = archivedSectionMappings.value.find(m => m.sectionId === sectionId)
    if (entry) {
      entry.courseIds.forEach(cid => {
        addSectionToCourse(sectionId, cid)
      })
    }

    archivedSectionMappings.value = archivedSectionMappings.value.filter(
      m => m.sectionId !== sectionId
    )
    saveArchivedSectionsToStorage()
  }

  function deleteSection(id: number) {
    allSections.value = allSections.value.filter(s => s.id !== id)
    courseSectionMappings.value = courseSectionMappings.value.filter(m => m.sectionId !== id)
    courseSectionSchedules.value = courseSectionSchedules.value.filter(s => s.sectionId !== id)
    saveCourseSectionMappingsToStorage()
    saveCourseSectionSchedulesToStorage()
  }

  function getSchedule(courseId: number, sectionId: number): CourseSectionSchedule | undefined {
    return courseSectionSchedules.value.find(
      s => s.courseId === courseId && s.sectionId === sectionId
    )
  }

  function setSchedule(courseId: number, sectionId: number, schedule: Omit<CourseSectionSchedule, 'courseId' | 'sectionId'>) {
    const index = courseSectionSchedules.value.findIndex(
      s => s.courseId === courseId && s.sectionId === sectionId
    )

    if (index !== -1) {
      courseSectionSchedules.value[index] = { courseId, sectionId, ...schedule }
    } else {
      courseSectionSchedules.value.push({ courseId, sectionId, ...schedule })
    }
    saveCourseSectionSchedulesToStorage()
  }

  function removeSchedule(courseId: number, sectionId: number) {
    courseSectionSchedules.value = courseSectionSchedules.value.filter(
      s => !(s.courseId === courseId && s.sectionId === sectionId)
    )
    saveCourseSectionSchedulesToStorage()
  }

  return {
    allSections,
    courseSectionMappings,
    courseSectionSchedules,
    archivedSectionMappings,
    loadArchivedSectionsFromStorage,
    getSectionsByCourse,
    addSection,
    addSectionToCourse,
    updateSection,
    removeSectionFromCourse,
    archiveSection,
    unarchiveSection,
    deleteSection,
    getSchedule,
    setSchedule,
    removeSchedule,
    setSectionsFromApi,
    fetchSectionsFromApi,
    isLoading,
    error,
  }
})
