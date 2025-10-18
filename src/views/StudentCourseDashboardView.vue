<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useStudentsStore } from '@/stores/studentsStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useAuthStore } from '@/stores/authStore'
import type { Student, StudentQuiz } from '@/interfaces/interfaces'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const StudentQuizList = defineAsyncComponent(() => import('@/components/student/StudentQuiz.vue'))

import bg1 from '@/assets/image/bg1.jpg'
import bg2 from '@/assets/image/bg2.jpg'
import bg3 from '@/assets/image/bg3.jpg'
import bg4 from '@/assets/image/bg4.jpg'
import bg5 from '@/assets/image/bg5.jpg'

// TYPES
type TabKey = 'quizzes' | 'score' | 'people'

interface MyScoreItem { 
  title: string; 
  score: number; 
  total: number; 
  percent: number; 
  due: string; 
  status: 'Answered' | 'Unanswered' 
}

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
const quizViewMode = ref<'cards' | 'rows'>('rows')
const scoreFilter = ref<'all' | 'answered' | 'unanswered'>('all')

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
        grade: 'N/A',
        progress: 0,
        initials: username.substring(0, 2).toUpperCase(),
        avatar: AVATAR_URL,
      }
    }
    const fullName = `${profile.firstName} ${profile.lastName}`.trim()
    return {
      id: i + 1,
      name: fullName,
      email: profile.email,
      grade: ['A', 'A-', 'B+'][i % 3],
      progress: 75 + ((i * 7) % 25),
      initials: fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(),
      avatar: profile.photoUrl || AVATAR_URL,
    }
  })
})

const myCourseQuizzes = computed<StudentQuiz[]>(() => {
  const all = quizzesStore.myStudentQuizzes
  const courseName = currentCourse.value?.name || ''
  return all.filter(q => q.subject === courseName)
})

const myScores = computed<MyScoreItem[]>(() => {
  const uname = myUsername.value
  return myCourseQuizzes.value.map((q, i) => {
    const total = 20
    const base = getDeterministicIndex(`${uname}-${q.id}`) % 21 // 0..20
    const score = Math.min(total, Math.max(0, base))
    const percent = Math.round((score / total) * 100)
    return {
      title: q.title,
      score,
      total,
      percent,
      due: q.dueDate,
      status: percent > 0 ? 'Answered' : 'Unanswered',
    }
  })
})

const filteredScores = computed<MyScoreItem[]>(() => {
  if (scoreFilter.value === 'all') return myScores.value
  if (scoreFilter.value === 'answered') return myScores.value.filter(s => s.status === 'Answered')
  return myScores.value.filter(s => s.status === 'Unanswered')
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

      <!-- Quizzes tab -->
      <div v-show="activeTab === 'quizzes'" class="rounded-lg overflow-hidden">
        <div class="px-6 flex justify-between items-center">
          <h2 class="text-xl font-semibold text-blue-800">My Quizzes</h2>
          <div class="inline-flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              class="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
              :class="quizViewMode === 'cards' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="quizViewMode = 'cards'"
              aria-label="Cards view"
              title="Cards view"
            >
              <i class="fas fa-grip"></i>
            </button>
            <button
              class="relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out"
              :class="quizViewMode === 'rows' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
              @click="quizViewMode = 'rows'"
              aria-label="Rows view"
              title="Rows view"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
        <div class="p-6">
          <StudentQuizList :quizzes="myCourseQuizzes" :hideHeader="true" :viewMode="quizViewMode" />
        </div>
      </div>

      <!-- Score tab  -->
      <div v-show="activeTab === 'score'" class="space-y-6">
        <div class="bg-white rounded-lg shadow border border-gray-200">
          <!-- Filter dropdown -->
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="relative w-full max-w-sm">
              <label class="block text-xs text-gray-500 mb-2">Task filter</label>
              <select 
                v-model="scoreFilter" 
                class="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="answered">Answered</option>
                <option value="unanswered">Unanswered</option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-10 text-gray-400 pointer-events-none"></i>
            </div>
          </div>

          <!-- Scores list -->
          <div class="divide-y divide-gray-100">
            <div 
              v-for="q in filteredScores" 
              :key="q.title" 
              class="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
            >
              <div class="flex-1">
                <h4 class="font-medium text-gray-900 mb-1">{{ q.title }}</h4>
                <p class="text-sm text-gray-500">Due {{ q.due }}</p>
              </div>
              <div class="flex items-center gap-6">
                <div class="text-right">
                  <div class="text-sm text-gray-500 mb-1">Status</div>
                  <div class="text-sm font-medium" :class="q.status === 'Answered' ? 'text-gray-700' : 'text-red-600'">
                    {{ q.status }}
                  </div>
                </div>
                <div class="text-right min-w-[80px]">
                  <div class="text-2xl font-semibold text-gray-900">{{ q.score }}/{{ q.total }}</div>
                </div>
              </div>
            </div>
            <div v-if="filteredScores.length === 0" class="px-6 py-12 text-center text-gray-500">
              <i class="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
              <p>No scores found</p>
            </div>
          </div>
        </div>
      </div>

      <!-- People tab -->
      <div v-show="activeTab === 'people'" class="space-y-8">
        <!-- Teachers Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-2xl font-semibold text-gray-900">Teachers</h2>
          </div>
          <div class="px-6 py-5">
            <div class="flex items-center gap-4 hover:bg-gray-50 -mx-6 px-6 py-3 transition-colors">
              <div class="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                {{ (currentCourse?.teacher || 'U').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() }}
              </div>
              <div class="font-medium text-gray-900">{{ currentCourse?.teacher }}</div>
            </div>
          </div>
        </div>

        <!-- Classmates Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 class="text-2xl font-semibold text-gray-900">Classmates</h2>
            <span class="text-sm text-gray-500">{{ students.length }} students</span>
          </div>
          <div class="divide-y divide-gray-100">
            <div 
              v-for="s in students" 
              :key="s.id" 
              class="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
            >
              <img 
                :src="s.avatar" 
                :alt="s.name" 
                class="h-10 w-10 rounded-full object-cover flex-shrink-0" 
              />
              <div class="font-medium text-gray-900">{{ s.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.classroom-banner {
  height: 250px;
}

.grade-progress {
  height: 8px;
  border-radius: 4px;
  background-color: #e0e7ff;
}

.grade-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  transition: width 0.5s ease;
}

@media (max-width: 768px) {
  .classroom-banner { height: 180px; }
}
</style>
