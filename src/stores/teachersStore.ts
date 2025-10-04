import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import type { TeacherProfile } from './types'

export const useTeachersStore = defineStore('teachers', () => {
  const profiles = ref<Record<string, TeacherProfile>>({
    '0112345678': {
      username: '0112345678',
      firstName: 'Donald',
      lastName: 'Francisco',
      email: 'donald.francisco@university.edu',
      phone: '+63 915 123 4567',
      department: 'Information Technology',
      bio: 'IT faculty focusing on systems and security. Passionate about student-centered learning and building practical projects.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0111111111': {
      username: '0111111111',
      firstName: 'Alice',
      lastName: 'Mao',
      email: 'alice.mao@university.edu',
      phone: '+63 916 234 5678',
      department: 'Computer Science',
      bio: 'Researches human-computer interaction and inclusive design. Loves mentoring capstone teams.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0112222222': {
      username: '0112222222',
      firstName: 'Brian',
      lastName: 'Lopez',
      email: 'brian.lopez@university.edu',
      phone: '+63 917 345 6789',
      department: 'Information Systems',
      bio: 'Focuses on databases and data warehousing. Enjoys bringing real-world case studies to class.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0113333333': {
      username: '0113333333',
      firstName: 'Celine',
      lastName: 'Garcia',
      email: 'celine.garcia@university.edu',
      phone: '+63 918 456 7890',
      department: 'Software Engineering',
      bio: 'Specializes in software architecture and agile methodologies. Advocates test-driven development.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0114444444': {
      username: '0114444444',
      firstName: 'Diego',
      lastName: 'Santos',
      email: 'diego.santos@university.edu',
      phone: '+63 919 567 8901',
      department: 'Cybersecurity',
      bio: 'Teaches network security and ethical hacking. Passionate about building a strong security mindset.',
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
