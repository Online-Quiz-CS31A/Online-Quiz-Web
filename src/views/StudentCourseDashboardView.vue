<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
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

// TYPES
type TabKey = 'quizzes' | 'score' | 'people'

// CONSTANTS
const coverImages = [bg1, bg2, bg3, bg4, bg5]
const AVATAR_URL = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'

// REACTIVE
const route = useRoute()
const classesStore = useCoursesStore()
const sectionsStore = useSectionsStore()
const studentsStore = useStudentsStore()
const quizzesStore = useQuizzesStore()
const authStore = useAuthStore()

// REF
const activeTab = ref<TabKey>('quizzes')

// COMPUTED
const courseId = computed(() => Number(route.params.id || 0))
const currentCourse = computed(() => classesStore.allCourses.find(c => c.id === courseId.value) || null)
const myUsername = computed(() => authStore.currentUser?.username || '')
const courseSections = computed(() => sectionsStore.getSectionsByCourse(courseId.value))

const mySection = computed(() => {
  const sections = courseSections.value
  const found = sections.find(s => (s.studentUsernames || []).includes(myUsername.value))
  return found || sections[0]
})

const scheduleInfo = computed(() => {
  if (!currentCourse.value || !mySection.value) return 'Schedule not set'
  const sched = sectionsStore.getSchedule(currentCourse.value.id, mySection.value.id)
  if (!sched) return 'Schedule not set'
  const [hours, minutes] = sched.scheduleTime.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 || 12
  const formattedTime = `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  return `${sched.scheduleDay}, ${formattedTime} - ${sched.classroom}`
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

    <div class="classroom-banner w-full flex items-end text-white" :style="heroStyle">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold mb-2">{{ currentCourse?.name || 'Course' }}</h1>
            <div class="mt-3 text-blue-100 text-sm flex items-center gap-2 mb-4">
              <i class="fas fa-clock"></i>
              <span>{{ scheduleInfo }}</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="relative">
                <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold ring-2 ring-white/20">
                  {{ (currentCourse?.teacher || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() }}
                </div>
              </div>
              <div class="leading-tight">
                <div class="text-white font-medium">{{ currentCourse?.teacher }}</div>
                <div class="text-blue-100 text-sm">{{ students.length }} students</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-4 py-8">
      <div class="flex border-b border-blue-200 mb-8 space-x-2">
        <button class="px-4 py-2 font-medium transition-colors cursor-pointer" :class="activeTab === 'quizzes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'" @click="activeTab = 'quizzes'">Quizzes</button>
        <button class="px-4 py-2 font-medium transition-colors cursor-pointer" :class="activeTab === 'score' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'" @click="activeTab = 'score'">Score</button>
        <button class="px-4 py-2 font-medium transition-colors cursor-pointer" :class="activeTab === 'people' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-blue-400 hover:text-blue-600'" @click="activeTab = 'people'">People</button>
      </div>

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
.classroom-banner {
  height: 250px;
}

@media (max-width: 768px) {
  .classroom-banner { height: 180px; }
}
</style>
