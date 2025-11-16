<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { defineAsyncComponent } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useCoursesStore } from '@/stores/coursesStore'
import { useQuizzesStore } from '@/stores/quizzesStore'
const ImportQuestionsModal = defineAsyncComponent(() => import('@/components/modals/ImportQuestionsModal.vue'))

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
const isStudent = computed(() => auth.userRole === 'student')
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
  router.push(`/teacher/create-quiz`)
}

function openImportModal() {
  showImportModal.value = true
}

function closeImportModal() {
  showImportModal.value = false
}

async function handleImport(file: File) {
  console.log('Importing file:', file.name)
  
  closeImportModal()
  
  try {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    const questions: ImportedQuestion[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim())
      if (cols.length < 2) continue
      
      const [type, question, points, optA, optB, optC, optD, correct, required] = cols
      
      const questionData: any = {
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
      } as any)
    }, 300)
  } catch (error) {
    console.error('Error parsing file:', error)
  }
}
</script>

<template>
  <div 
    :class="[
      'sidebar w-64 bg-white shadow-lg fixed h-full overflow-y-auto z-40',
      { 'active': isActive }
    ]"
  >
    
    <div class="p-4">
      <div class="mb-6">
        <h2 class="text-xs uppercase font-semibold text-gray-500 mb-2"></h2>
        <ul>
          <li class="mb-1">
            <button @click="$emit('nav-home')" class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" :class="(isHomeActive || activeSection === 'home') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'">
              <i class="fas fa-home mr-3"></i>
              <span>Home</span>
            </button>
          </li>
          <li class="mb-1">
            <button 
              @click="classesOpen = !classesOpen"
              class="w-full flex items-center p-2 rounded-md text-gray-700 cursor-pointer"
              :class="isCoursesActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'"
            >
              <i class="fas fa-book-open mr-3"></i>
              <span>My Courses</span>
              <i 
                class="fas fa-chevron-down ml-auto transition-transform duration-200"
                :class="classesOpen ? 'rotate-180' : ''"
              ></i>
            </button>
            <ul v-show="classesOpen" class="mt-1 ml-6">
              <li v-for="cls in myClasses" :key="cls.id" class="mb-1">
                <RouterLink
                  v-if="isTeacher"
                  :to="{ name: 'teacher-class', params: { id: cls.id } }"
                  class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <span class="w-4 h-4 rounded-full mr-3" :class="colorDotClass(cls.color)"></span>
                  <span>{{ cls.name }}</span>
                </RouterLink>
                <RouterLink
                  v-else
                  :to="{ name: 'student-course-dashboard', params: { id: cls.id } }"
                  class="flex items-center p-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  <span class="w-4 h-4 rounded-full mr-3" :class="colorDotClass(cls.color)"></span>
                  <span>{{ cls.name }}</span>
                </RouterLink>
              </li>
            </ul>
          </li>
          <li class="mb-1">
            <button @click="$emit('nav-quizzes')" class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" :class="isQuizzesActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'">
              <i class="fas fa-clipboard-list mr-3"></i>
              <span>Quizzes</span>
            </button>
          </li>
          <li class="mb-1">
            <button @click="$emit('nav-calendar')" class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" :class="isCalendarActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'">
              <i class="fas fa-calendar-alt mr-3"></i>
              <span>Calendar</span>
            </button>
          </li>
          <li class="mb-1" v-if="isTeacher">
            <button 
              @click="archivedOpen = !archivedOpen"
              class="w-full flex items-center p-2 rounded-md text-left cursor-pointer" 
              :class="isArchivedActive ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'"
            >
              <i class="fas fa-box-archive mr-3"></i>
              <span>Archived</span>
              <i 
                class="fas fa-chevron-down ml-auto transition-transform duration-200"
                :class="archivedOpen ? 'rotate-180' : ''"
              ></i>
            </button>
            <ul v-show="archivedOpen" class="mt-1 ml-6">
              <li class="mb-1">
                <button
                  @click="archivedQuizzesOpen = !archivedQuizzesOpen; $emit('nav-archived-quizzes')"
                  class="w-full flex items-center p-2 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  <i class="fas fa-clipboard-list mr-3"></i>
                  <span>Quizzes</span>
                  <i 
                    class="fas fa-chevron-down ml-auto transition-transform duration-200"
                    :class="archivedQuizzesOpen ? 'rotate-180' : ''"
                  ></i>
                </button>
                <ul v-show="archivedQuizzesOpen" class="mt-1 ml-6">
                  <li class="mb-1">
                    <button 
                      @click="$emit('nav-archived-quizzes-published')"
                      class="w-full flex items-center p-2 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      <i class="fas fa-circle-check mr-3"></i>
                      <span>Published</span>
                    </button>
                  </li>
                  <li class="mb-1">
                    <button 
                      @click="$emit('nav-archived-quizzes-draft')"
                      class="w-full flex items-center p-2 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100"
                    >
                      <i class="fas fa-file-pen mr-3"></i>
                      <span>Draft</span>
                    </button>
                  </li>
                </ul>
              </li>
              <li class="mb-1">
                <button 
                  @click="$emit('nav-archived-courses')"
                  class="w-full flex items-center p-2 rounded-md text-gray-700 cursor-pointer hover:bg-gray-100"
                >
                  <i class="fas fa-book-open mr-3"></i>
                  <span>Courses</span>
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      
      <!-- Teacher actions -->
      <div class="mb-6" v-if="isTeacher">
        <button 
          @click="navigateToQuizCreator"
          class="w-full mb-2 bg-white border border-2 border-blue-600 text-blue-600 hover:bg-blue-700 hover:text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors cursor-pointer"
        >
          <i class="fas fa-plus mr-2 "></i> Create Quiz
        </button>
        <button 
          @click="openImportModal"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors cursor-pointer"
        >
          <i class="fas fa-upload mr-2"></i> Import Questions
        </button>
      </div>

      <!-- Student actions -->
      <div class="mb-6" v-else-if="isStudent">
        <button 
          @click="$emit('join-class')"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          <i class="fas fa-user-plus mr-2"></i> Join Class
        </button>
      </div>
    </div>
    
    <!-- Import Questions Modal -->
    <ImportQuestionsModal 
      :open="showImportModal"
      @close="closeImportModal"
      @import="handleImport"
    />
  </div>
</template>

