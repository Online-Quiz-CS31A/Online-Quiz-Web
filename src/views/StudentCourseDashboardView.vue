<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useAuthStore } from '@/stores/authStore'
import type { Student } from '@/interfaces/interfaces'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const StudentCourseQuizzesTab = defineAsyncComponent(() => import('@/components/student/StudentCourseQuizzesTab.vue'))
const StudentCourseScoreTab = defineAsyncComponent(() => import('@/components/student/StudentCourseScoreTab.vue'))
const StudentCoursePeopleTab = defineAsyncComponent(() => import('@/components/student/StudentCoursePeopleTab.vue'))
import bg1 from '@/assets/image/bg1.webp'
import bg2 from '@/assets/image/bg2.webp'
import bg3 from '@/assets/image/bg3.webp'
import bg4 from '@/assets/image/bg4.webp'
import bg5 from '@/assets/image/bg5.webp'

type TabKey = 'quizzes' | 'score' | 'people'

const coverImages = [bg1, bg2, bg3, bg4, bg5]
const AVATAR_URL = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

const route = useRoute()
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const studentsStore = useStudentsStore()
const authStore = useAuthStore()

const activeTab = ref<TabKey>('quizzes')

const courseId = computed(() => Number(route.params.id || 0))
const currentCourse = computed(() => classesStore.allCourses.find(c => c.id === courseId.value) || null)
const myUsername = computed(() => authStore.currentUser?.username || '')
const courseSections = computed(() => sectionsStore.getSectionsByCourse(courseId.value))

const mySection = computed(() => {
  const sections = courseSections.value
  const found = sections.find(s => (s.studentUsernames || []).includes(myUsername.value))
  return found || sections[0]
})

const heroStyle = computed(() => {
  const id = currentCourse.value?.id || 0
  const name = currentCourse.value?.name || ''
  const index = getDeterministicIndex(`${id}-${name}`)
  const url = coverImages[index % coverImages.length]
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

const students = computed<Student[]>(() => {
  const sect = mySection.value
  if (!sect) return []
  const usernames = sect.studentUsernames || []
  return usernames.map((username, i) => {
    const profile = studentsStore.profiles[username]
    if (!profile) {
      return {
        id: i + 1,
        name: username,
        email: `${username}@unknown.com`,
        initials: username.substring(0, 2).toUpperCase(),
        avatar: AVATAR_URL,
      }
    }
    const fullName = `${profile.firstName} ${profile.lastName}`.trim()
    return {
      id: i + 1,
      name: fullName,
      email: profile.email,
      initials: fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
      avatar: profile.photoUrl || AVATAR_URL,
    }
  })
})

// WATCHERS
watch(courseId, () => {
  activeTab.value = 'quizzes'
})

// METHODS
const getDeterministicIndex = (key: string) => {
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

</script>

<template>
  <div class="bg-white min-h-screen">
    <Header :breadcrumb="`Dashboard > Courses > ${currentCourse?.name || 'Course'}`" />

    <!-- Course Hero Section -->
    <div class="relative overflow-hidden bg-white border-b border-gray-200">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0" :style="heroStyle">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/85 to-blue-900/90"></div>
      </div>

      <!-- Content -->
      <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <!-- Course Info -->
          <div class="flex-1">
            <!-- Course Code Badge -->
            <div class="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mb-3">
              <span class="text-xs font-semibold text-white">{{ currentCourse?.code || 'COURSE' }}</span>
            </div>

            <!-- Course Title -->
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {{ currentCourse?.name || 'Course' }}
            </h1>

            <!-- Course Meta Info -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-white/90">
              <!-- Students Count -->
              <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <i class="fas fa-users"></i>
                <span>{{ currentCourse?.students ?? 0 }} students</span>
              </div>
            </div>
          </div>

          <!-- Teacher Info Card -->
          <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl">
            <p class="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Instructor</p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/30">
                {{ (currentCourse?.teacher || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() }}
              </div>
              <div>
                <p class="text-white font-semibold">{{ currentCourse?.teacher }}</p>
                <p class="text-white/70 text-sm">Course Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-1" aria-label="Tabs">
          <button
            @click="activeTab = 'quizzes'"
            class="px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2"
            :class="activeTab === 'quizzes'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'"
          >
            <i class="fas fa-clipboard-list mr-2"></i>
            Quizzes
          </button>
          <button
            @click="activeTab = 'score'"
            class="px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2"
            :class="activeTab === 'score'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'"
          >
            <i class="fas fa-chart-line mr-2"></i>
            Score
          </button>
          <button
            @click="activeTab = 'people'"
            class="px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2"
            :class="activeTab === 'people'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'"
          >
            <i class="fas fa-user-group mr-2"></i>
            People
          </button>
        </nav>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <StudentCourseQuizzesTab
        v-show="activeTab === 'quizzes'"
        :courseName="currentCourse?.name || ''"
      />

      <StudentCourseScoreTab
        v-show="activeTab === 'score'"
        :courseName="currentCourse?.name || ''"
      />

      <StudentCoursePeopleTab
        v-show="activeTab === 'people'"
        :teacherName="currentCourse?.teacher || null"
        :students="students"
      />
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed - using pure Tailwind */
</style>
