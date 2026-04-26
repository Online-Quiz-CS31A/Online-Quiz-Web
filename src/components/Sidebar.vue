<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
const ImportQuestionsModal = defineAsyncComponent(() => import('@/components/modals/ImportQuestionsModal.vue'))

// eslint-disable-next-line vue/multi-word-component-names
defineOptions({ name: 'Sidebar' })

// TYPES
interface Props {
  isActive: boolean
  activeSection?: 'home' | 'quizzes' | 'calendar' | 'courses' | 'archived'
}
type ImportedQuestion = {
  id: number
  type: string
  question: string
  points: number
  required: boolean
  options?: string[]
  correctAnswer?: string
}

// CONSTANTS
const router = useRouter()

// REACTIVE
const route = useRoute()

// REFS
const classesOpen = ref(false)
const showImportModal = ref(false)
const archivedOpen = ref(false)
const archivedQuizzesOpen = ref(false)
const auth = useAuthStore()
const classesStore = useCoursesStore()
const quizzesStore = useQuizzesStore()

// PROPS
const props = defineProps<Props>()
defineEmits<{
  close: []
  'create-quiz': []
  'import-questions': []
  'join-class': []
  'nav-home': []
  'nav-quizzes': []
  'nav-calendar': []
  'nav-archived': []
  'nav-archived-courses': []
  'nav-archived-classes': []
  'nav-archived-quizzes': []
  'nav-archived-quizzes-published': []
  'nav-archived-quizzes-draft': []
}>()

// WATCHERS
watch(
  () => props.activeSection,
  (section) => {
    if (section === 'archived') {
      archivedOpen.value = true
    }
  },
)

// COMPUTED
const isCoursesActive = computed(() => {
  return (
    props.activeSection === 'courses' ||
    route.name === 'teacher-courses' ||
    route.name === 'teacher-class' ||
    route.name === 'teacher-class-dashboard'
  )
})
const isHomeActive = computed(() => route.name === 'home')
const activeSection = computed(() => props.activeSection)
const isQuizzesActive = computed(() => activeSection.value === 'quizzes')
const isCalendarActive = computed(() => activeSection.value === 'calendar')
const isArchivedActive = computed(() => activeSection.value === 'archived')
const isTeacher = computed(() => auth.userRole === 'teacher')
const myClasses = computed(() => classesStore.myClasses)

// METHODS
const colorMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  teal: 'bg-teal-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  yellow: 'bg-yellow-500',
}
function colorDotClass(color?: string) {
  return color ? (colorMap[color] || 'bg-gray-400') : 'bg-gray-400'
}

function navigateToQuizCreator() {
  quizzesStore.resetCurrentQuiz()

  let classId = '1'
  if (myClasses.value.length > 0) {
    classId = String(myClasses.value[0].id)
  }

  router.push({ name: 'quiz-builder', params: { id: classId } })
}

function openImportModal() {
  showImportModal.value = true
}

function closeImportModal() {
  showImportModal.value = false
}

async function handleImport(file: File) {
  closeImportModal()

  try {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    const questions: ImportedQuestion[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length < 2) continue

      const [type, question, points, optA, optB, optC, optD, correct, required] = cols

      const questionData: ImportedQuestion = {
        id: Date.now() + i,
        type: type || 'short-answer',
        question: question || '',
        points: parseInt(points) || 1,
        required: required?.toLowerCase() === 'yes'
      }

      if (type === 'multiple-choice') {
        questionData.options = [optA, optB, optC, optD].filter(Boolean)
        questionData.correctAnswer = correct || 'A'
      } else if (type === 'true-false') {
        questionData.options = ['True', 'False']
        questionData.correctAnswer = correct || 'A'
      }

      questions.push(questionData)
    }

    let classIdParam = route.params.id as string | number | undefined
    if (!classIdParam && myClasses.value.length > 0) {
      classIdParam = myClasses.value[0].id as unknown as string | number
    }
    const classId = String(classIdParam ?? '1')

    setTimeout(() => {
      router.push({
        name: 'quiz-builder',
        params: { id: classId },
        state: { importedQuestions: questions }
      })
    }, 300)
  } catch (error) {
    console.error('Error parsing file:', error)
  }
}
</script>

<template>
  <div
    :class="[
      'sidebar w-64 bg-white border-r border-gray-200 fixed h-full overflow-y-auto z-40',
      { 'active': isActive }
    ]"
  >
    <!-- Logo/Brand Section -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
          <img src="/src/assets/image/ACLC.webp" alt="ACLC Logo" class="w-full h-full object-contain" />
        </div>
        <div>
          <h1 class="text-base font-bold text-gray-900">ACLC Online Quiz</h1>
          <p class="text-xs text-gray-500">{{ isTeacher ? 'Teacher' : 'Student' }} Portal</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="p-4">
      <!-- Main Navigation -->
      <div class="mb-6">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Menu</p>
        <ul class="space-y-1">
          <li>
            <button
              @click="$emit('nav-home')"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              :class="(isHomeActive || activeSection === 'home')
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-home w-5"></i>
              <span class="ml-3">Home</span>
            </button>
          </li>

          <li>
            <button
              @click="classesOpen = !classesOpen"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              :class="isCoursesActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-book-open w-5"></i>
              <span class="ml-3 flex-1 text-left">My Courses</span>
              <i
                class="fas fa-chevron-down text-xs transition-transform duration-200"
                :class="classesOpen ? 'rotate-180' : ''"
              ></i>
            </button>
            <ul v-show="classesOpen" class="mt-1 ml-8 space-y-1">
              <li v-for="cls in myClasses" :key="cls.id">
                <RouterLink
                  v-if="isTeacher"
                  :to="{ name: 'teacher-class', params: { code: cls.code } }"
                  class="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <span class="w-2 h-2 rounded-full mr-3 flex-shrink-0" :class="colorDotClass(cls.color)"></span>
                  <span class="truncate">{{ cls.name }}</span>
                </RouterLink>
                <RouterLink
                  v-else
                  :to="{ name: 'student-course-dashboard', params: { id: cls.id } }"
                  class="flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <span class="w-2 h-2 rounded-full mr-3 flex-shrink-0" :class="colorDotClass(cls.color)"></span>
                  <span class="truncate">{{ cls.name }}</span>
                </RouterLink>
              </li>
            </ul>
          </li>

          <li>
            <button
              @click="$emit('nav-quizzes')"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              :class="isQuizzesActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-clipboard-list w-5"></i>
              <span class="ml-3">Quizzes</span>
            </button>
          </li>

          <li v-if="isTeacher">
            <button
              @click="$emit('nav-calendar')"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              :class="isCalendarActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-calendar-alt w-5"></i>
              <span class="ml-3">Calendar</span>
            </button>
          </li>

          <li v-if="isTeacher">
            <button
              @click="archivedOpen = !archivedOpen"
              class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              :class="isArchivedActive
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'"
            >
              <i class="fas fa-box-archive w-5"></i>
              <span class="ml-3 flex-1 text-left">Archived</span>
              <i
                class="fas fa-chevron-down text-xs transition-transform duration-200"
                :class="archivedOpen ? 'rotate-180' : ''"
              ></i>
            </button>
            <ul v-show="archivedOpen" class="mt-1 ml-8 space-y-1">
              <li>
                <button
                  @click="archivedQuizzesOpen = !archivedQuizzesOpen; $emit('nav-archived-quizzes')"
                  class="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <i class="fas fa-clipboard-list w-4"></i>
                  <span class="ml-3 flex-1 text-left">Quizzes</span>
                  <i
                    class="fas fa-chevron-down text-xs transition-transform duration-200"
                    :class="archivedQuizzesOpen ? 'rotate-180' : ''"
                  ></i>
                </button>
                <ul v-show="archivedQuizzesOpen" class="mt-1 ml-6 space-y-1">
                  <li>
                    <button
                      @click="$emit('nav-archived-quizzes-published')"
                      class="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <i class="fas fa-circle-check w-4 text-xs"></i>
                      <span class="ml-3">Published</span>
                    </button>
                  </li>
                  <li>
                    <button
                      @click="$emit('nav-archived-quizzes-draft')"
                      class="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <i class="fas fa-file-pen w-4 text-xs"></i>
                      <span class="ml-3">Draft</span>
                    </button>
                  </li>
                </ul>
              </li>
              <li>
                <button
                  @click="$emit('nav-archived-classes')"
                  class="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <i class="fas fa-users w-4"></i>
                  <span class="ml-3">Classes</span>
                </button>
              </li>
              <li>
                <button
                  @click="$emit('nav-archived-courses')"
                  class="w-full flex items-center px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <i class="fas fa-book-open w-4"></i>
                  <span class="ml-3">Courses</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- Teacher Actions -->
      <div v-if="isTeacher" class="pt-4 border-t border-gray-100">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Actions</p>
        <div class="space-y-2">
          <button
            @click="navigateToQuizCreator"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 px-4 rounded-lg flex items-center justify-center text-sm font-medium shadow-sm hover:shadow transition-all duration-200"
          >
            <i class="fas fa-plus mr-2"></i>
            <span>Create Quiz</span>
          </button>
          <button
            @click="openImportModal"
            class="w-full bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200"
          >
            <i class="fas fa-upload mr-2"></i>
            <span>Import Questions</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Import Questions Modal -->
    <ImportQuestionsModal
      :open="showImportModal"
      @close="closeImportModal"
      @import="handleImport"
    />
  </div>
</template>

