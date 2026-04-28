import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import type { StudentProfile, YearLevel } from '../interfaces/interfaces'
import api from '../services/api'

export const useStudentsStore = defineStore('students', () => {
  const profiles = ref<Record<string, StudentProfile>>({})

  const auth = useAuthStore()

  const currentProfile = computed<StudentProfile | null>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return null
    return profiles.value[uname] ?? null
  })

  function updateCurrentStudentProfile(update: Partial<Omit<StudentProfile, 'username'>>) {
    const uname = auth.currentUser?.username
    if (!uname) return
    const existing = profiles.value[uname]
    if (!existing) return
    profiles.value[uname] = { ...existing, ...update }
  }

  function setCurrentPhoto(url: string) {
    updateCurrentStudentProfile({ photoUrl: url })
  }

  async function fetchAllStudentsFromApi(force = false) {
    if (!force && Object.keys(profiles.value).length > 0) {
        return Object.keys(profiles.value).length
    }
    
    try {
      const response = await api.get('/User')
      const allUsers = response.data || []

      const studentUsers = allUsers.filter((u: any) => u.roleName === 'Student')

      const yearLevelMap: Record<number, YearLevel> = {
        1: '1st Year',
        2: '2nd Year',
        3: '3rd Year',
        4: '4th Year',
      }

      const fetchedProfiles: Record<string, StudentProfile> = {}

      studentUsers.forEach((user: any) => {
        const studentData = user.student || {}
        const studentId = studentData.studentId || user.email?.split('@')[0] || String(user.userId)
        const yearLevelNum = studentData.yearLevel || 1

        const fullName = user.fullName || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        fetchedProfiles[studentId] = {
          username: studentId,
          firstName: firstName || user.fullName || 'Unknown',
          lastName: lastName,
          email: user.email || '',
          phone: user.contactNumber || '+63 000 000 0000',
          yearLevel: yearLevelMap[yearLevelNum] || '1st Year',
          program: studentData.course || 'BS Information Technology',
          bio: `Student in section ${studentData.section || 'A'}`,
          photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
        }
      })

      profiles.value = { ...profiles.value, ...fetchedProfiles }

      return Object.keys(fetchedProfiles).length
    } catch (err) {
      console.error('Failed to fetch students from API:', err)
      return 0
    }
  }

  return {
    profiles,
    currentProfile,
    updateCurrentStudentProfile,
    setCurrentPhoto,
    fetchAllStudentsFromApi,
  }
})
