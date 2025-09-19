import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

export interface TeacherProfile {
  username: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  bio: string
  photoUrl?: string
}

export const useTeachersStore = defineStore('teachers', () => {
  const profiles = ref<Record<string, TeacherProfile>>({
    '0112345678': {
      username: '0112345678',
      firstName: 'Donald',
      lastName: 'Francisco',
      email: 'donald.francisco@university.edu',
      phone: '(555) 000-0000',
      department: 'Information Technology',
      bio: 'IT faculty focusing on systems and security. Passionate about student-centered learning and building practical projects.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
  })

  const auth = useAuthStore()

  const currentProfile = computed<TeacherProfile | null>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return null
    return profiles.value[uname] ?? null
  })

  function updateCurrentTeacherProfile(update: Partial<Omit<TeacherProfile, 'username'>>) {
    const uname = auth.currentUser?.username
    if (!uname) return
    const existing = profiles.value[uname]
    if (!existing) return
    profiles.value[uname] = { ...existing, ...update }
  }

  function setCurrentPhoto(url: string) {
    updateCurrentTeacherProfile({ photoUrl: url })
  }

  return {
    profiles,
    currentProfile,
    updateCurrentTeacherProfile,
    setCurrentPhoto,
  }
})
