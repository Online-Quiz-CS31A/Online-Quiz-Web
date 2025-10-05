import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { ClassSection, CourseSectionMapping, CourseSectionSchedule } from './types'
import { useAuthStore } from './authStore'

export const useSectionsStore = defineStore('sections', () => {
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

  function getSectionsByCourse(courseId: number): ClassSection[] {
    const sectionIds = courseSectionMappings.value
      .filter(m => m.courseId === courseId)
      .map(m => m.sectionId)
    
    return allSections.value.filter(s => sectionIds.includes(s.id))
  }

  function addSection(newSection: Omit<ClassSection, 'id'>, courseId: number) {
    const lastSection = allSections.value.length ? allSections.value[allSections.value.length - 1] : undefined
    const nextId = ((lastSection?.id) || 0) + 1
    allSections.value.push({ id: nextId, ...newSection })
    
    courseSectionMappings.value.push({ courseId, sectionId: nextId })
  }

  function addSectionToCourse(sectionId: number, courseId: number) {
    const exists = courseSectionMappings.value.some(
      m => m.courseId === courseId && m.sectionId === sectionId
    )
    if (!exists) {
      courseSectionMappings.value.push({ courseId, sectionId })
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
  }

  function deleteSection(id: number) {
    allSections.value = allSections.value.filter(s => s.id !== id)
    courseSectionMappings.value = courseSectionMappings.value.filter(m => m.sectionId !== id)
    courseSectionSchedules.value = courseSectionSchedules.value.filter(s => s.sectionId !== id)
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
  }

  function removeSchedule(courseId: number, sectionId: number) {
    courseSectionSchedules.value = courseSectionSchedules.value.filter(
      s => !(s.courseId === courseId && s.sectionId === sectionId)
    )
  }

  return {
    allSections,
    courseSectionMappings,
    courseSectionSchedules,
    getSectionsByCourse,
    addSection,
    addSectionToCourse,
    updateSection,
    removeSectionFromCourse,
    deleteSection,
    getSchedule,
    setSchedule,
    removeSchedule,
  }
})
