<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuizzesStore } from '@/stores/quizzesStore'
import { useSectionsStore } from '@/stores/sectionsStore'
import { useCoursesStore } from '@/stores/coursesStore'
import type { TeacherQuizItem } from '@/interfaces/interfaces'
import QuizDeleteDraftModal from '@/components/modals/QuizDeleteDraftModal.vue'
import QuizDeletePublishedModal from '@/components/modals/QuizDeletePublishedModal.vue'
import ConfirmUnarchiveModal from '@/components/modals/ConfirmUnarchiveModal.vue'
import quiz1 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103442.webp'
import quiz2 from '@/assets/image/quiz_bg/Screenshot 2025-08-21 103614.webp'
import quiz3 from '@/assets/image/quiz_bg/liquid-cheese.webp'
import quiz4 from '@/assets/image/quiz_bg/radiant-gradient.webp'
import quiz5 from '@/assets/image/quiz_bg/subtle-prism.webp'

// TYPES
interface Props {
  quizzes: TeacherQuizItem[]
  hideAppHeader?: boolean
  viewMode?: 'cards' | 'rows'
  showFilters?: boolean
  initialFilter?: 'all' | 'draft' | 'published'
  archivedMode?: boolean
  archivedContextType?: 'section' | 'course' | null
  archivedSectionId?: number | null
}

// CONSTANTS
const coverImages = [quiz1, quiz2, quiz3, quiz4, quiz5]
const router = useRouter()
const quizzesStore = useQuizzesStore()
const sectionsStore = useSectionsStore()

const getPrimarySection = (quiz: TeacherQuizItem) => {
  if (Array.isArray(quiz.assignedSections) && quiz.assignedSections.length > 0) return String(quiz.assignedSections[0])
  return quiz.class || ''
}

const getSectionLabel = (quiz: TeacherQuizItem) => {
  if (Array.isArray(quiz.assignedSections) && quiz.assignedSections.length > 0) {
    const arr = quiz.assignedSections
    if (arr.length === 1) return String(arr[0])
    return `${String(arr[0])} (+${arr.length - 1} more)`
  }
  return quiz.class || ''
}

// PROPS
const props = withDefaults(defineProps<Props>(), {
  hideAppHeader: false,
  viewMode: 'cards',
  showFilters: false,
  initialFilter: 'all',
  archivedMode: false,
})

// EMITS
const emit = defineEmits<{
  'view-all': []
  'quiz-archived': []
  'quiz-unarchived': []
}>()

// REFS
const openMenuId = ref<number | null>(null)
const statusFilter = ref<'all' | 'draft' | 'published'>(props.initialFilter)
const quizPendingDeletion = ref<TeacherQuizItem | null>(null)
const quizPendingUnarchive = ref<TeacherQuizItem | null>(null)
const showDraftDeleteModal = ref(false)
const showPublishedDeleteModal = ref(false)
const showUnarchiveModal = ref(false)

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

const toggleMenu = (quizId: number) => {
  openMenuId.value = openMenuId.value === quizId ? null : quizId
}

const closeMenu = () => {
  openMenuId.value = null
}

const openQuizInBuilder = async (quiz: TeacherQuizItem) => {
  await quizzesStore.loadQuizForEditingAsync(quiz.id)
  router.push({
    name: 'quiz-builder',
    params: { id: getPrimarySection(quiz) || 'default' },
    query: {
      archivedContext: props.archivedContextType || undefined,
      sectionId:
        props.archivedContextType === 'section' && props.archivedSectionId != null
          ? String(props.archivedSectionId)
          : undefined,
    },
  })
}

const handleEditQuiz = (quiz: TeacherQuizItem) => {
  openQuizInBuilder(quiz)
  closeMenu()
}

const handleViewQuiz = (quiz: TeacherQuizItem) => {
  openQuizInBuilder(quiz)
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

const handleConfirmDelete = async () => {
  if (!quizPendingDeletion.value) {
    handleCancelDelete()
    return
  }
  try {
    await quizzesStore.archiveQuiz(quizPendingDeletion.value.id)
    emit('quiz-archived')
  } catch (error) {
    console.error('Archive failed:', error)
  }
  handleCancelDelete()
}

const handleUnarchiveQuiz = (quiz: TeacherQuizItem) => {
  quizPendingUnarchive.value = quiz
  showUnarchiveModal.value = true
  closeMenu()
}

const handleCancelUnarchive = () => {
  showUnarchiveModal.value = false
  quizPendingUnarchive.value = null
}

const handleConfirmUnarchive = async () => {
  if (!quizPendingUnarchive.value) {
    handleCancelUnarchive()
    return
  }
  try {
    await quizzesStore.unarchiveQuiz(quizPendingUnarchive.value.id)
    emit('quiz-unarchived')
  } catch (error) {
    console.error('Unarchive failed:', error)
  }
  handleCancelUnarchive()
}

const handleQuizClick = (quiz: TeacherQuizItem) => {
  openQuizInBuilder(quiz)
}

const getSubmissionStats = (quiz: TeacherQuizItem) => {
  const submitted = quizzesStore.getQuizUniqueSubmitterCount(quiz.id)
  const coursesStore = useCoursesStore()

  const quizSection = (Array.isArray(quiz.assignedSections) && quiz.assignedSections.length > 0
    ? String(quiz.assignedSections[0])
    : quiz.class || '').trim().toLowerCase() ?? ''
  const quizSubject = quiz.subject?.trim().toLowerCase() ?? ''

  let matchingCourse = coursesStore.rawTeacherCourses.find(
    rc => rc.section?.trim().toLowerCase() === quizSection
      && rc.name?.trim().toLowerCase() === quizSubject
  )
  
  if (!matchingCourse) {
    matchingCourse = coursesStore.rawTeacherCourses.find(
      rc => rc.section?.trim().toLowerCase() === quizSection
    )
  }

  const total = matchingCourse
    ? (matchingCourse.students || 0)
    : (() => {

        const name = ((Array.isArray(quiz.assignedSections) && quiz.assignedSections.length > 0)
          ? String(quiz.assignedSections[0])
          : (quiz.class || '')).trim()
        if (!name) return quiz.total || 0

        const matchedSections = sectionsStore.allSections.filter(s => (s.name || '').trim() === name)
        const unique = new Set<string | number>()
        for (const sec of matchedSections) {
          const usernames = sec.studentUsernames || []
          for (const u of usernames) unique.add(u)
        }

        if (unique.size > 0) return unique.size
        const single = sectionsStore.allSections.find(s => (s.name || '').trim() === name)
        return single?.students || quiz.total || 0
      })()

  const percent = total > 0 ? Math.min(100, (submitted / total) * 100) : 0
  return { submitted, total, percent }
}

const formatDueDate = (dateStr: string) => {
  if (!dateStr) return 'No due date'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return `Due: ${dateStr}`

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (targetDate.getTime() === today.getTime()) {
    return 'Due: Today'
  }

  if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Due: Tomorrow'
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(date)

  return `Due: ${formattedDate}`
}
</script>

<template>
  <div class="mb-8">
    <div v-if="!props.hideAppHeader" class="flex justify-between items-center mb-4">
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

    <!-- Loading State -->
    <div v-if="quizzesStore.isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
        <div class="h-32 bg-gradient-to-br from-gray-200 to-gray-300"></div>
        <div class="p-4 space-y-3">
          <div class="bg-gray-100 rounded-lg px-4 py-3">
            <div class="flex items-center gap-2.5">
              <div class="w-5 h-5 bg-gray-200 rounded"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          <div class="flex items-center">
            <div class="w-5 h-5 bg-gray-200 rounded mr-2.5"></div>
            <div class="h-3 bg-gray-200 rounded w-32"></div>
          </div>
          <div class="pt-2">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredQuizzes.length === 0" class="p-12 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-gray-200">
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
        class="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
        :class="[quiz.status === 'draft' ? 'border-amber-300' : '']"
        @click="handleQuizClick(quiz)"
      >
        <!-- Header with background image -->
        <div class="relative h-32 overflow-hidden">
          <div
            v-if="quiz.status !== 'draft'"
            class="absolute inset-0 bg-cover bg-center transform group-hover:scale-105 transition-transform duration-300"
            :style="getCoverStyle(quiz)"
          ></div>
          <div
            v-else
            class="absolute inset-0 bg-gradient-to-br from-slate-600 to-slate-700"
          ></div>
          <div class="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-transparent"></div>

          <!-- Status badges -->
          <div class="absolute top-3 left-3 flex gap-2">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/20 text-white border border-white/30">
              {{ formatDueDate(quiz.dueDate) }}
            </span>
            <span
              v-if="quiz.status === 'draft'"
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-white backdrop-blur-sm"
            >
              <i class="fas fa-file-pen mr-1"></i>DRAFT
            </span>
          </div>

          <!-- Actions menu -->
          <div class="absolute right-2 top-2">
            <button
              @click.stop="toggleMenu(quiz.id)"
              class="text-white hover:text-white p-2 rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors cursor-pointer"
              title="More options"
            >
              <i class="fas fa-ellipsis-vertical"></i>
            </button>
            <div
              v-if="openMenuId === quiz.id"
              class="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-md shadow-lg border border-gray-200 py-1 z-10"
              @click.stop
            >
              <template v-if="quiz.archived">
                <button
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                  @click="handleViewQuiz(quiz)"
                >
                  View
                </button>
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
                >
                  Edit
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                  @click="handleDeleteQuiz(quiz)"
                >
                  Archive
                </button>
              </template>
            </div>
          </div>

          <!-- Quiz title -->
          <div class="absolute bottom-3 left-4 right-4">
            <h3 class="text-lg font-bold text-white line-clamp-2 drop-shadow-lg">
              {{ quiz.title }}
            </h3>
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4 space-y-3">
          <!-- Course info -->
          <div class="bg-blue-50 rounded-lg px-4 py-3">
            <div class="flex items-center gap-2.5">
              <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div class="flex-1 min-w-0">
                <div class="text-base leading-relaxed">
                  <span class="font-semibold text-blue-700">{{ quiz.subject }}</span>
                  <span v-if="getSectionLabel(quiz)" class="text-gray-500 text-sm ml-2">
                    ({{ getSectionLabel(quiz) }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action button or submission stats -->
          <div class="pt-2">
            <template v-if="quiz.status === 'draft'">
              <button v-if="!quiz.archived" class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center group-hover:shadow-md">
                <i class="fas fa-edit mr-2"></i>
                Continue Editing
                <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <div v-else class="text-sm text-gray-400 italic text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <i class="fas fa-archive mr-1.5"></i> Archived Draft
              </div>
            </template>
            <template v-else>
              <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span class="font-medium">Submissions</span>
                <span class="font-semibold text-gray-900">
                  {{ getSubmissionStats(quiz).submitted }}/{{ getSubmissionStats(quiz).total }}
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${getSubmissionStats(quiz).percent}%` }"
                ></div>
              </div>
            </template>
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
                  <span class="text-xs" :class="quiz.status === 'draft' ? 'text-slate-600' : 'text-gray-500'">{{ formatDueDate(quiz.dueDate) }}</span>
                  <span
                    v-if="quiz.status === 'draft'"
                    class="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded-full"
                  >
                    <i class="fas fa-file-pen mr-1"></i>DRAFT
                  </span>
                </div>
                <div class="text-base font-semibold" :class="quiz.status === 'draft' ? 'text-slate-800' : 'text-gray-900'">{{ quiz.title }}</div>
                <div class="text-sm" :class="quiz.status === 'draft' ? 'text-slate-600' : 'text-gray-600'">{{ quiz.subject }}<span v-if="getSectionLabel(quiz)" class="text-gray-500 ml-2">({{ getSectionLabel(quiz) }})</span></div>
                <div v-if="quiz.status === 'draft'" class="mt-3">
                  <button v-if="!quiz.archived" class="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                    <i class="fas fa-edit"></i>
                    <span>Continue Editing</span>
                    <i class="fas fa-arrow-right text-xs"></i>
                  </button>
                  <div v-else class="text-xs text-gray-400 italic">
                    <i class="fas fa-archive mr-1"></i> Archived Draft
                  </div>
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
                  <template v-if="quiz.archived">
                    <button
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="handleViewQuiz(quiz)"
                    >
                      View
                    </button>
                    <button
                      class="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      @click="handleUnarchiveQuiz(quiz)"
                    >
                      Unarchive
                    </button>
                  </template>
                  <template v-else>
                    <button
                      class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      @click="handleEditQuiz(quiz)"
                    >
                      Edit
                    </button>
                    <button
                      class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      @click="handleDeleteQuiz(quiz)"
                    >
                      Archive
                    </button>
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

	<ConfirmUnarchiveModal
	  :open="showUnarchiveModal"
	  :item-name="quizPendingUnarchive?.title"
	  title="Unarchive quiz?"
	  @cancel="handleCancelUnarchive"
	  @confirm="handleConfirmUnarchive"
	/>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
