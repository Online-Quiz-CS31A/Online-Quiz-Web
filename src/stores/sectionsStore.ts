import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassSection, CourseSectionMapping, CourseSectionSchedule } from '@/interfaces/interfaces'
import { useAuthStore } from './authStore'
import api from '../services/api'

export const useSectionsStore = defineStore('sections', () => {
  interface TeacherCourseDto {
    courseId: number
    code: string
    name: string
    instructorId: number
    instructorName: string
    status: string
    category: string
    section: string
    createdAt: string
  }

  const allSections = ref<ClassSection[]>([
    {
      id: 1,
      name: 'CS31A',
      students: 3,
      studentUsernames: ['0212345678', '0221111111', '0222222222']  // Chitoge, Mika, Ken
    },
    {
      id: 2,
      name: 'IT11B',
      students: 3,
      studentUsernames: ['0223333333', '0224444444', '0225555555']  // Sofia, Liam, Emma
    },
    {
      id: 3,
      name: 'CS22A',
      students: 3,
      studentUsernames: ['0226666666', '0227777777', '0228888888']  // Noah, Olivia, James
    },
    {
      id: 4,
      name: 'IT22A',
      students: 3,
      studentUsernames: ['0229999999', '0231111111', '0232222222']  // Ava, Lucas, Isabella
    },
    {
      id: 5,
      name: 'CS33A',
      students: 3,
      studentUsernames: ['0233333333', '0234444444', '0235555555']  // Mason, Sophia, Ethan
    },
  ])

  const courseSectionMappings = ref<CourseSectionMapping[]>([
    { courseId: 1, sectionId: 1 },
    { courseId: 2, sectionId: 2 },
    { courseId: 3, sectionId: 3 },
    { courseId: 5, sectionId: 4 },
    { courseId: 6, sectionId: 1 },
    { courseId: 6, sectionId: 5 },
  ])

  const courseSectionSchedules = ref<CourseSectionSchedule[]>([
    { courseId: 1, sectionId: 1, scheduleDay: 'Monday', scheduleTime: '15:00', classroom: 'Room 101' },
    { courseId: 2, sectionId: 2, scheduleDay: 'Tuesday', scheduleTime: '10:00', classroom: 'Room 202' },
    { courseId: 3, sectionId: 3, scheduleDay: 'Wednesday', scheduleTime: '13:00', classroom: 'Room 303' },
    { courseId: 5, sectionId: 4, scheduleDay: 'Thursday', scheduleTime: '15:00', classroom: 'Room 404' },
    { courseId: 6, sectionId: 1, scheduleDay: 'Tuesday', scheduleTime: '13:00', classroom: 'Room 105' },
    { courseId: 6, sectionId: 5, scheduleDay: 'Friday', scheduleTime: '09:00', classroom: 'Room 505' },
  ])

  const auth = useAuthStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const archivedSectionMappings = ref<{ sectionId: number; courseIds: number[] }[]>([])

  async function fetchTeacherSections() {
    const user = auth.currentUser
    if (!user || user.role !== 'teacher' || !user.id) return

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<TeacherCourseDto[]>(`/Course/teacher/${user.id}`)
      const data = response.data || []

      const grouped = new Map<string, TeacherCourseDto[]>()
      data.forEach(c => {
        if (!c.code) return
        if (!grouped.has(c.code)) grouped.set(c.code, [])
        grouped.get(c.code)!.push(c)
      })

      const newSections: ClassSection[] = []
      const newMappings: CourseSectionMapping[] = []

      for (const [code, items] of grouped) {
        const parentId = items[0].courseId 

        items.forEach(item => {
          newSections.push({
            id: item.courseId,
            name: item.section || item.name,
            students: 0,
            studentUsernames: []
          })

          newMappings.push({
            courseId: parentId,
            sectionId: item.courseId
          })
        })
      }

      allSections.value = newSections
      courseSectionMappings.value = newMappings

      saveCourseSectionMappingsToStorage()

    } catch (e: any) {
      console.error('Failed to fetch teacher sections:', e)
      error.value = e.message || 'Failed to load sections'
    } finally {
      isLoading.value = false
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

  loadCourseSectionDataFromStorage()
  loadArchivedSectionsFromStorage()

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
    fetchTeacherSections,
    isLoading,
    error,
  }
})
