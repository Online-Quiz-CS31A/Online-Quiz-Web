<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import type { TeacherQuizItem } from '@/interfaces/interfaces'
import QuizDeleteDraftModal from '@/components/modals/QuizDeleteDraftModal.vue'
import QuizDeletePublishedModal from '@/components/modals/QuizDeletePublishedModal.vue'
import quiz1 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103442.png'
import quiz2 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103614.png'
import quiz3 from '@/assets/image/quiz_bg/liquid-cheese.png'
import quiz4 from '@/assets/image/quiz_bg/radiant-gradient.png'
import quiz5 from '@/assets/image/quiz_bg/subtle-prism.png'

// TYPES
interface Props {
  quizzes: TeacherQuizItem[]
  hideHeader?: boolean
  viewMode?: 'cards' | 'rows'
  showFilters?: boolean
  initialFilter?: 'all' | 'draft' | 'published'
  archivedMode?: boolean
}

// CONSTANTS
const coverImages = [quiz1, quiz2, quiz3, quiz4, quiz5]
const router = useRouter()
const quizzesStore = useQuizzesStore()
const sectionsStore = useSectionsStore()

// PROPS
const props = withDefaults(defineProps<Props>(), {
  hideHeader: false,
  viewMode: 'cards',
  showFilters: false,
  initialFilter: 'all',
  archivedMode: false,
})

// EMITS
const emit = defineEmits<{
  'view-all': []
}>()

// REFS
const openMenuId = ref<number | null>(null)
const statusFilter = ref<'all' | 'draft' | 'published'>(props.initialFilter)
const quizPendingDeletion = ref<TeacherQuizItem | null>(null)
const showDraftDeleteModal = ref(false)
const showPublishedDeleteModal = ref(false)
 
// COMPUTED
const filteredQuizzes = computed(() => {
  let filtered = [...props.quizzes]
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(q => (q.status || 'published') === statusFilter.value)
  }
  
  return filtered.sort((a, b) => {
    const aStatus = a.status || 'published'
    const bStatus = b.status || 'published'
    
    if (aStatus === 'draft' && bStatus !== 'draft') return -1
    if (aStatus !== 'draft' && bStatus === 'draft') return 1
    
    const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime()
    const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime()
    return bDate - aDate
  })
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

const getCoverStyle = (quiz: TeacherQuizItem) => {
  const index = getDeterministicIndex(`${quiz.id}-${quiz.title}`)
  const url = coverImages[index % coverImages.length]
  return {
    backgroundImage: `url(${url})`
  }
}

const getCardColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-200 text-blue-900',
    green: 'bg-green-200 text-green-900',
    purple: 'bg-purple-200 text-purple-900',
    red: 'bg-red-200 text-red-900',
    yellow: 'bg-yellow-200 text-yellow-900',
    indigo: 'bg-indigo-200 text-indigo-900',
    pink: 'bg-pink-200 text-pink-900',
    teal: 'bg-teal-200 text-teal-900',
    orange: 'bg-orange-200 text-orange-900',
    cyan: 'bg-cyan-200 text-cyan-900'
  }
  return colorMap[color] || colorMap.blue
}

const toggleMenu = (quizId: number) => {
  openMenuId.value = openMenuId.value === quizId ? null : quizId
}

const closeMenu = () => {
  openMenuId.value = null
}

const handleEditQuiz = (quiz: TeacherQuizItem) => {
  console.log(`Editing quiz: ${quiz.title}`)
  closeMenu()
}

const handleDeleteQuiz = (quiz: TeacherQuizItem) => {
  quizPendingDeletion.value = quiz
  if ((quiz.status || 'published') === 'draft') {
    showDraftDeleteModal.value = true
  } else {
    showPublishedDeleteModal.value = true
  }
  closeMenu()
}

const handleCancelDelete = () => {
  showDraftDeleteModal.value = false
  showPublishedDeleteModal.value = false
  quizPendingDeletion.value = null
}

const handleConfirmDelete = () => {
  if (!quizPendingDeletion.value) {
    handleCancelDelete()
    return
  }
  quizzesStore.archiveQuiz(quizPendingDeletion.value.id)
  handleCancelDelete()
}

const handleUnarchiveQuiz = (quiz: TeacherQuizItem) => {
  quizzesStore.unarchiveQuiz(quiz.id)
  closeMenu()
}

const handleQuizClick = (quiz: TeacherQuizItem) => {
  quizzesStore.loadQuizForEditing(quiz.id)
  router.push({ name: 'quiz-builder', params: { id: quiz.class || 'default' } })
}

const getSubmissionStats = (quiz: TeacherQuizItem) => {
  const submitted = quizzesStore.getQuizUniqueSubmitterCount(quiz.id)
  const section = sectionsStore.allSections.find(s => s.name === quiz.class)
  const total = section
    ? (section.studentUsernames?.length || section.students || 0)
    : (quiz.total || 0)
  const percent = total > 0 ? Math.min(100, (submitted / total) * 100) : 0

  return {
    submitted,
    total,
    percent
  }
}
</script>

<template>
  <div class="mb-8">
    <div v-if="!props.hideHeader" class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">Quizzes</h2>
      <button @click="emit('view-all')" type="button" class="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer">View All</button>
    </div>
    
    <!-- Filter Buttons -->
    <div v-if="props.showFilters" class="flex gap-2 mb-4">
      <button
        @click="statusFilter = 'all'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
          statusFilter === 'all'
            ? 'bg-blue-600 text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
        ]"
      >
        All
      </button>
      <button
        @click="statusFilter = 'draft'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
          statusFilter === 'draft'
            ? 'bg-amber-600 text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
        ]"
      >
        <i class="fas fa-file-pen mr-2"></i>Drafts
      </button>
      <button
        @click="statusFilter = 'published'"
        :class="[
          'px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer',
          statusFilter === 'published'
            ? 'bg-green-600 text-white shadow-md'
            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
        ]"
      >
        <i class="fas fa-check-circle mr-2"></i>Published
      </button>
    </div>
    
    <!-- Empty State -->
    <div v-if="filteredQuizzes.length === 0" class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200">
      <div class="relative mb-6">
        <div class="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
          <i class="fas fa-clipboard-list text-4xl text-blue-400"></i>
        </div>
        <div class="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
          <i class="fas fa-plus text-white text-sm"></i>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">No Quizzes Yet</h3>
      <p class="text-gray-500 max-w-md mb-6">
        You haven't created any quizzes yet. Start creating engaging assessments for your students.
      </p>
    </div>
    
    <div v-else-if="props.viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
      <div 
        v-for="quiz in filteredQuizzes" 
        :key="quiz.id"
        class="quiz-card rounded-xl shadow-md overflow-hidden"
        :class="[
          quiz.status === 'draft' ? 'draft-card' : getCardColorClasses(quiz.color)
        ]"
        :style="quiz.status === 'draft' ? {} : { ...getCoverStyle(quiz), backgroundSize: 'cover', backgroundPosition: 'center' }"
        @click="handleQuizClick(quiz)"
      >
        <div class="p-5 min-h-[180px] flex flex-col justify-between" :class="quiz.status === 'draft' ? 'bg-gradient-to-br from-slate-600 to-slate-700' : ''">
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs" :class="quiz.status === 'draft' ? 'text-slate-200' : 'text-white'">Due: {{ quiz.dueDate }}</span>
              <span 
                v-if="quiz.status === 'draft'"
                class="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-sm"
              >
                <i class="fas fa-file-pen mr-1"></i>DRAFT
              </span>
            </div>
            <div class="relative">
              <button
                @click.stop="toggleMenu(quiz.id)"
                :class="quiz.status === 'draft' ? 'text-slate-200 hover:text-white' : 'text-white hover:text-gray-200'"
                class="text-lg transition-colors cursor-pointer"
                title="More options"
              >
                <i class="fas fa-ellipsis-vertical"></i>
              </button>
              <div
                v-if="openMenuId === quiz.id"
                class="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-md shadow-lg border border-gray-200 py-1 z-10"
                @click.stop
              >
                <template v-if="(props as any).archivedMode">
                  <button
                    class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                    @click="handleUnarchiveQuiz(quiz)"
                  >
                    Unarchive
                  </button>
                </template>
                <template v-else>
                  <button
                    class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    @click="handleEditQuiz(quiz)"
                  >Edit 
                  </button>
                  <button
                    class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    @click="handleDeleteQuiz(quiz)"
                  >Delete
                  </button>
                </template>
              </div>
            </div>
          </div>
          <h3 class="text-lg font-bold mb-2" :class="quiz.status === 'draft' ? 'text-white' : 'text-white'">{{ quiz.title }}</h3>
          <p class="text-sm mb-4" :class="quiz.status === 'draft' ? 'text-slate-200' : 'text-white/90'">{{ quiz.subject }}</p>
        </div>
        <div class="px-5 py-3 h-12" :class="quiz.status === 'draft' ? 'bg-slate-100' : 'bg-white'">
          <div v-if="quiz.status === 'draft'" class="flex items-center justify-end h-full">
            <button class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
              <span>Continue Editing</span>
            </button>
          </div>
          <div v-else class="flex items-center gap-3 h-full">
            <span class="text-xs text-gray-500 whitespace-nowrap">
              {{ getSubmissionStats(quiz).submitted }}/{{ getSubmissionStats(quiz).total }} submitted
            </span>
            <div class="flex-1 bg-gray-200 rounded-full h-1.5">
              <div 
                class="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                :style="{ width: `${getSubmissionStats(quiz).percent}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="quiz in filteredQuizzes" 
        :key="quiz.id"
        class="rounded-lg border overflow-hidden cursor-pointer"
        :class="quiz.status === 'draft' ? 'border-slate-400 bg-slate-50 draft-card' : 'border-gray-200 bg-white'"
        @click="handleQuizClick(quiz)"
      >
        <div class="flex items-stretch">
          <div v-if="quiz.status !== 'draft'" class="hidden md:block w-48 bg-cover bg-center" :style="getCoverStyle(quiz)"></div>
          <div v-else class="hidden md:block w-48 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
            <i class="fas fa-file-pen text-5xl text-slate-300"></i>
          </div>
          <div class="flex-1 p-4">
            <div class="flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs" :class="quiz.status === 'draft' ? 'text-slate-600' : 'text-gray-500'">Due: {{ quiz.dueDate }}</span>
                  <span 
                    v-if="quiz.status === 'draft'"
                    class="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full"
                  >
                    <i class="fas fa-file-pen mr-1"></i>DRAFT
                  </span>
                </div>
                <div class="text-base font-semibold" :class="quiz.status === 'draft' ? 'text-slate-800' : 'text-gray-900'">{{ quiz.title }}</div>
                <div class="text-sm" :class="quiz.status === 'draft' ? 'text-slate-600' : 'text-gray-600'">{{ quiz.subject }}</div>
                <div v-if="quiz.status === 'draft'" class="mt-3">
                  <button class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                    <i class="fas fa-edit"></i>
                    <span>Continue Editing</span>
                    <i class="fas fa-arrow-right text-xs"></i>
                  </button>
                </div>
                <div v-else class="mt-3 flex items-center gap-2">
                  <span class="text-xs text-gray-500">
                    {{ getSubmissionStats(quiz).submitted }}/{{ getSubmissionStats(quiz).total }} submitted
                  </span>
                  <div class="w-40 bg-gray-200 rounded-full h-1.5">
                    <div
                      class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      :style="{ width: `${getSubmissionStats(quiz).percent}%` }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="relative ml-3">
                <button
                  @click.stop="toggleMenu(quiz.id)"
                  class="text-gray-600 hover:text-gray-800 p-1"
                  title="More options"
                >
                  <i class="fas fa-ellipsis-vertical"></i>
                </button>
                <div
                  v-if="openMenuId === quiz.id"
                  class="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-md shadow-lg border border-gray-200 py-1 z-10"
                  @click.stop
                >
                  <template v-if="(props as any).archivedMode">
                    <button class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50" @click="handleUnarchiveQuiz(quiz)">Unarchive</button>
                  </template>
                  <template v-else>
                    <button class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" @click="handleEditQuiz(quiz)">Edit</button>
                    <button class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" @click="handleDeleteQuiz(quiz)">Delete</button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <QuizDeleteDraftModal
      :open="showDraftDeleteModal"
      :quiz-title="quizPendingDeletion?.title"
      @cancel="handleCancelDelete"
      @confirm="handleConfirmDelete"
    />

    <QuizDeletePublishedModal
      :open="showPublishedDeleteModal"
      :quiz-title="quizPendingDeletion?.title"
      @cancel="handleCancelDelete"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>



<style scoped>
.quiz-card {
  transition: all 0.3s ease;
}

.quiz-card:hover {
  box-shadow: 0 8px 15px rgba(0,0,0,0.1);
}

.draft-card {
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.draft-card:hover {
  box-shadow: 0 8px 15px rgba(0,0,0,0.15), 0 0 0 3px rgba(59, 130, 246, 0.5);
}
</style>
