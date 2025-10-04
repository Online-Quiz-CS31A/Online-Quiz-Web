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
      phone: '+63 917 123 4567',
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
      phone: '+63 918 234 5678',
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
      phone: '+63 919 345 6789',
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
      phone: '+63 920 456 7890',
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
      phone: '+63 921 567 8901',
      yearLevel: '3rd Year',
      program: 'BS Cybersecurity',
      bio: 'Competes in CTFs and studies network security. Aims to become a blue team analyst.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0225555555': {
      username: '0225555555',
      firstName: 'Emma',
      lastName: 'Garcia',
      email: 'emma.garcia@student.university.edu',
      phone: '+63 922 678 9012',
      yearLevel: '2nd Year',
      program: 'BS Information Technology',
      bio: 'Passionate about mobile app development and user experience design.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0226666666': {
      username: '0226666666',
      firstName: 'Noah',
      lastName: 'Santos',
      email: 'noah.santos@student.university.edu',
      phone: '+63 923 789 0123',
      yearLevel: '3rd Year',
      program: 'BS Computer Science',
      bio: 'Interested in machine learning and data science. Working on research projects.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0227777777': {
      username: '0227777777',
      firstName: 'Olivia',
      lastName: 'Reyes',
      email: 'olivia.reyes@student.university.edu',
      phone: '+63 924 890 1234',
      yearLevel: '1st Year',
      program: 'BS Information Systems',
      bio: 'Enjoys system administration and cloud computing. Exploring DevOps practices.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0228888888': {
      username: '0228888888',
      firstName: 'James',
      lastName: 'Dela Cruz',
      email: 'james.delacruz@student.university.edu',
      phone: '+63 925 901 2345',
      yearLevel: '4th Year',
      program: 'BS Software Engineering',
      bio: 'Full-stack developer focused on web technologies. Contributing to open-source projects.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0229999999': {
      username: '0229999999',
      firstName: 'Ava',
      lastName: 'Martinez',
      email: 'ava.martinez@student.university.edu',
      phone: '+63 926 012 3456',
      yearLevel: '2nd Year',
      program: 'BS Cybersecurity',
      bio: 'Interested in ethical hacking and penetration testing. Member of cybersecurity club.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0231111111': {
      username: '0231111111',
      firstName: 'Lucas',
      lastName: 'Villanueva',
      email: 'lucas.villanueva@student.university.edu',
      phone: '+63 927 123 4567',
      yearLevel: '3rd Year',
      program: 'BS Computer Science',
      bio: 'Game development enthusiast. Creating indie games with Unity and Unreal Engine.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0232222222': {
      username: '0232222222',
      firstName: 'Isabella',
      lastName: 'Ramos',
      email: 'isabella.ramos@student.university.edu',
      phone: '+63 928 234 5678',
      yearLevel: '1st Year',
      program: 'BS Information Technology',
      bio: 'UI/UX designer and front-end developer. Loves creating beautiful interfaces.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0233333333': {
      username: '0233333333',
      firstName: 'Mason',
      lastName: 'Torres',
      email: 'mason.torres@student.university.edu',
      phone: '+63 929 345 6789',
      yearLevel: '4th Year',
      program: 'BS Information Systems',
      bio: 'Database administrator and backend developer. Optimizing queries and system performance.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0234444444': {
      username: '0234444444',
      firstName: 'Sophia',
      lastName: 'Hernandez',
      email: 'sophia.hernandez@student.university.edu',
      phone: '+63 930 456 7890',
      yearLevel: '2nd Year',
      program: 'BS Software Engineering',
      bio: 'Agile practitioner and scrum enthusiast. Leading student project teams.',
      photoUrl: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
    },
    '0235555555': {
      username: '0235555555',
      firstName: 'Ethan',
      lastName: 'Bautista',
      email: 'ethan.bautista@student.university.edu',
      phone: '+63 931 567 8901',
      yearLevel: '3rd Year',
      program: 'BS Cybersecurity',
      bio: 'Network security specialist. Studying cryptography and secure communications.',
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
