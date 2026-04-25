<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useCoursesStore } from '@/stores/coursesStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
import * as courseService from '@/services/courseService'
import type { ClassmateDto } from '@/services/types'
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

const route = useRoute()
const classesStore = useCoursesStore()
const quizzesStore = useQuizzesStore()

const activeTab = ref<TabKey>('quizzes')
const classmates = ref<ClassmateDto[]>([])
const isLoading = ref(true)

const courseId = computed(() => Number(route.params.id || 0))
const currentCourse = computed(() => classesStore.allCourses.find(c => c.id === courseId.value) || null)

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

async function fetchClassmates() {
  const cId = courseId.value
  if (!cId) return
  try {
    classmates.value = await courseService.getCourseClassmates(cId)
  } catch {
    classmates.value = []
  }
}

watch(courseId, () => {
  activeTab.value = 'quizzes'
  fetchClassmates()
})

onMounted(async () => {
  isLoading.value = true

  try {
    if (classesStore.allCourses.length === 0) {
      await classesStore.fetchStudentCourses()
    }

    if (quizzesStore.myStudentQuizzes.length === 0) {
      await quizzesStore.fetchStudentQuizzesAsync()
    }

    await fetchClassmates()
  } finally {
    isLoading.value = false
  }
})

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

    <!-- Loading State with Skeleton -->
    <div v-if="isLoading">
      <!-- Hero Skeleton -->
      <div class="relative overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 border-b border-gray-200">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <!-- Course Info Skeleton -->
            <div class="flex-1">
              <!-- Course Code Badge Skeleton -->
              <div class="inline-flex items-center px-3 py-1 rounded-full bg-white/40 backdrop-blur-sm border border-white/30 mb-3">
                <div class="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
              </div>

              <!-- Course Title Skeleton -->
              <div class="mb-4">
                <div class="h-10 w-80 bg-gray-300 rounded animate-pulse"></div>
              </div>

              <!-- Course Meta Info Skeleton -->
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  <div class="h-4 w-24 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            <!-- Teacher Info Card Skeleton -->
            <div class="bg-white/20 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl w-full md:w-auto">
              <div class="h-3 w-20 bg-gray-300 rounded mb-2 animate-pulse"></div>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gray-300 animate-pulse"></div>
                <div>
                  <div class="h-4 w-32 bg-gray-300 rounded mb-2 animate-pulse"></div>
                  <div class="h-3 w-28 bg-gray-300 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Skeleton -->
      <div class="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex space-x-1">
            <div class="px-6 py-4 border-b-2 border-blue-600">
              <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div class="px-6 py-4 border-b-2 border-transparent">
              <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div class="px-6 py-4 border-b-2 border-transparent">
              <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Skeleton - Matches Quiz Card Structure -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="space-y-3">
          <div v-for="i in 4" :key="i" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="p-6">
              <div class="flex items-start justify-between gap-4">
                <!-- Quiz Info Skeleton -->
                <div class="flex-1 min-w-0">
                  <div class="h-5 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div class="flex items-center gap-4">
                    <div class="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div class="h-5 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <!-- Score Display Skeleton -->
                <div class="flex items-center gap-6">
                  <!-- Percentage Circle Skeleton -->
                  <div class="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center animate-pulse">
                    <div class="h-6 w-12 bg-gray-200 rounded"></div>
                  </div>

                  <!-- Points Skeleton -->
                  <div class="text-right">
                    <div class="h-3 w-12 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div class="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div class="h-2 w-10 bg-gray-200 rounded mt-1 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Progress Bar Skeleton -->
            <div class="h-1 bg-gray-100">
              <div class="h-full w-3/4 bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
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
          :classmates="classmates"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed - using pure Tailwind */
</style>
