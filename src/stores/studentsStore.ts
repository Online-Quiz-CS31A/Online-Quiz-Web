import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import type { StudentProfile } from './types'

export const useStudentsStore = defineStore('students', () => {
  const profiles = ref<Record<string, StudentProfile>>({
    '0212345678': {
      username: '0212345678',
      firstName: 'Chitoge',
      lastName: 'Kirisaki',
      email: 'chitoge.kirisaki@student.university.edu',
      phone: '(555) 900-0000',
      yearLevel: '3rd Year',
      program: 'BS Information Technology',
      bio: 'Active in programming clubs and hackathons. Enjoys building front-end projects and UI experiments.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0221111111': {
      username: '0221111111',
      firstName: 'Mika',
      lastName: 'Tan',
      email: 'mika.tan@student.university.edu',
      phone: '(555) 911-1111',
      yearLevel: '1st Year',
      program: 'BS Computer Science',
      bio: 'Interested in AI fundamentals and discrete math. Loves study groups and tutoring peers.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0222222222': {
      username: '0222222222',
      firstName: 'Ken',
      lastName: 'Yamada',
      email: 'ken.yamada@student.university.edu',
      phone: '(555) 922-2222',
      yearLevel: '2nd Year',
      program: 'BS Information Systems',
      bio: 'Enjoys data visualization and dashboard building. Working on an open-source analytics tool.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0223333333': {
      username: '0223333333',
      firstName: 'Sofia',
      lastName: 'Romero',
      email: 'sofia.romero@student.university.edu',
      phone: '(555) 933-3333',
      yearLevel: '4th Year',
      program: 'BS Software Engineering',
      bio: 'Team lead for capstone on microservices. Passionate about clean code and documentation.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0224444444': {
      username: '0224444444',
      firstName: 'Liam',
      lastName: 'Cruz',
      email: 'liam.cruz@student.university.edu',
      phone: '(555) 944-4444',
      yearLevel: '3rd Year',
      program: 'BS Cybersecurity',
      bio: 'Competes in CTFs and studies network security. Aims to become a blue team analyst.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
  })

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

  return {
    profiles,
    currentProfile,
    updateCurrentStudentProfile,
    setCurrentPhoto,
  }
})
