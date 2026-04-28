<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, CheckCircle, Clock, ChevronDown, ChevronUp, RefreshCw, ArrowLeft, Users } from 'lucide-vue-next'
import { getPendingEssays, gradeEssayAnswer, type PendingEssayQuiz, type PendingEssayAnswer } from '@/services/manualGradingService'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const toast = useToast()

// STATE
const pendingQuizzes = ref<PendingEssayQuiz[]>([])
const isLoading = ref(true)
const expandedQuizzes = ref<Set<number>>(new Set())
const expandedSections = ref<Set<string>>(new Set())
const gradingAnswerId = ref<number | null>(null)

// Grading form state
const selectedAnswer = ref<PendingEssayAnswer | null>(null)
const gradingMode = ref<'full' | 'partial' | 'none'>('full')
const partialPoints = ref(0)
const feedback = ref('')
const showGradingModal = ref(false)

// Filter state
const selectedSection = ref<string>('All Sections')

// COMPUTED
const totalPending = computed(() => 
  pendingQuizzes.value.reduce((sum, quiz) => sum + quiz.pendingCount, 0)
)

// Group quizzes by section (course name)
const quizzesBySection = computed(() => {
  const grouped = new Map<string, PendingEssayQuiz[]>()
  
  pendingQuizzes.value.forEach(quiz => {
    const section = quiz.courseName || 'Uncategorized'
    if (!grouped.has(section)) {
      grouped.set(section, [])
    }
    grouped.get(section)!.push(quiz)
  })
  
  return grouped
})

// Get unique sections for filter
const sections = computed(() => {
  const sectionSet = new Set<string>()
  pendingQuizzes.value.forEach(quiz => {
    sectionSet.add(quiz.courseName || 'Uncategorized')
  })
  return ['All Sections', ...Array.from(sectionSet).sort()]
})

// Filter quizzes by selected section
const filteredQuizzesBySection = computed(() => {
  if (selectedSection.value === 'All Sections') {
    return quizzesBySection.value
  }
  
  const filtered = new Map<string, PendingEssayQuiz[]>()
  const quizzes = quizzesBySection.value.get(selectedSection.value)
  if (quizzes) {
    filtered.set(selectedSection.value, quizzes)
  }
  return filtered
})

// METHODS
async function loadPendingEssays() {
  isLoading.value = true
  try {
    const response = await getPendingEssays()
    pendingQuizzes.value = response.data
  } catch (error: any) {
    console.error('Failed to load pending essays:', error)
    toast.error('Failed to load pending essays')
  } finally {
    isLoading.value = false
  }
}

function toggleSection(section: string) {
  if (expandedSections.value.has(section)) {
    expandedSections.value.delete(section)
  } else {
    expandedSections.value.add(section)
  }
}

function isSectionExpanded(section: string): boolean {
  return expandedSections.value.has(section)
}

function toggleQuiz(quizId: number) {
  if (expandedQuizzes.value.has(quizId)) {
    expandedQuizzes.value.delete(quizId)
  } else {
    expandedQuizzes.value.add(quizId)
  }
}

function isQuizExpanded(quizId: number): boolean {
  return expandedQuizzes.value.has(quizId)
}

function openGradingModal(answer: PendingEssayAnswer) {
  selectedAnswer.value = answer
  gradingMode.value = 'full'
  partialPoints.value = answer.questionPoints
  feedback.value = ''
  showGradingModal.value = true
}

function closeGradingModal() {
  showGradingModal.value = false
  selectedAnswer.value = null
  feedback.value = ''
}

async function submitGrade() {
  if (!selectedAnswer.value) return

  gradingAnswerId.value = selectedAnswer.value.attemptAnswerId

  try {
    let isCorrect = false
    let pointsAwarded: number | undefined

    if (gradingMode.value === 'full') {
      isCorrect = true
      pointsAwarded = selectedAnswer.value.questionPoints
    } else if (gradingMode.value === 'partial') {
      isCorrect = true
      pointsAwarded = partialPoints.value
    } else {
      isCorrect = false
      pointsAwarded = 0
    }

    await gradeEssayAnswer(selectedAnswer.value.attemptAnswerId, {
      isCorrect,
      pointsAwarded,
      feedback: feedback.value || undefined
    })

    toast.success('Essay graded successfully')
    closeGradingModal()
    await loadPendingEssays()
  } catch (error: any) {
    console.error('Failed to grade essay:', error)
    toast.error(error.response?.data?.message || 'Failed to grade essay')
  } finally {
    gradingAnswerId.value = null
  }
}

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

function goBack() {
  router.back()
}

function getSectionPendingCount(section: string): number {
  const quizzes = quizzesBySection.value.get(section) || []
  return quizzes.reduce((sum, quiz) => sum + quiz.pendingCount, 0)
}

// LIFECYCLE
onMounted(() => {
  loadPendingEssays()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Banner -->
    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <!-- Back Button -->
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-all duration-200 cursor-pointer mb-4"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Back</span>
        </button>
        
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-start gap-3 sm:gap-4">
            <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/30">
              <FileText class="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
                Manual Grading
              </h1>
              <p class="mt-1 text-sm sm:text-base text-blue-100">
                Grade essay questions that require manual review
              </p>
            </div>
          </div>
          <button
            @click="loadPendingEssays"
            :disabled="isLoading"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/30 transition-all duration-200 cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
            <span class="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <!-- Summary Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ totalPending }}</h2>
              <p class="text-sm text-gray-600">Pending Essay{{ totalPending !== 1 ? 's' : '' }}</p>
            </div>
          </div>
          
          <!-- Section Filter -->
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5 text-gray-400" />
            <select
              v-model="selectedSection"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option v-for="section in sections" :key="section" :value="section">
                {{ section }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading pending essays...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="pendingQuizzes.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p class="text-gray-600">No pending essay questions to grade at this time.</p>
      </div>

      <!-- Sections List -->
      <div v-else class="space-y-6">
        <div
          v-for="[sectionName, quizzes] in filteredQuizzesBySection"
          :key="sectionName"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <!-- Section Header -->
          <button
            @click="toggleSection(sectionName)"
            class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users class="w-5 h-5 text-indigo-600" />
              </div>
              <div class="text-left">
                <h2 class="text-lg font-semibold text-gray-900">{{ sectionName }}</h2>
                <p class="text-sm text-gray-600">{{ quizzes.length }} quiz{{ quizzes.length !== 1 ? 'zes' : '' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                <Clock class="w-4 h-4 mr-1" />
                {{ getSectionPendingCount(sectionName) }} pending
              </span>
              <ChevronDown v-if="!isSectionExpanded(sectionName)" class="w-5 h-5 text-gray-400" />
              <ChevronUp v-else class="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <!-- Quizzes in Section -->
          <div v-if="isSectionExpanded(sectionName)" class="divide-y divide-gray-100">
            <div
              v-for="quiz in quizzes"
              :key="quiz.quizId"
              class="bg-gray-50"
            >
              <!-- Quiz Header -->
              <button
                @click="toggleQuiz(quiz.quizId)"
                class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-4">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText class="w-4 h-4 text-blue-600" />
                  </div>
                  <div class="text-left">
                    <h3 class="text-base font-semibold text-gray-900">{{ quiz.quizTitle }}</h3>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ quiz.pendingCount }} pending
                  </span>
                  <ChevronDown v-if="!isQuizExpanded(quiz.quizId)" class="w-4 h-4 text-gray-400" />
                  <ChevronUp v-else class="w-4 h-4 text-gray-400" />
                </div>
              </button>

              <!-- Essay Answers List -->
              <div v-if="isQuizExpanded(quiz.quizId)" class="bg-white">
                <div
                  v-for="answer in quiz.pendingAnswers"
                  :key="answer.attemptAnswerId"
                  class="px-6 py-4 border-t border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="text-sm font-medium text-gray-900">{{ answer.studentName }}</span>
                        <span class="text-xs text-gray-500">•</span>
                        <span class="text-xs text-gray-500">{{ formatDate(answer.answeredAt) }}</span>
                      </div>
                      <p class="text-sm font-medium text-gray-700 mb-2">{{ answer.questionBody }}</p>
                      <p class="text-xs text-gray-500 mb-2">{{ answer.questionPoints }} points</p>
                      <div class="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
                        <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ answer.studentAnswer }}</p>
                      </div>
                    </div>
                    <button
                      @click="openGradingModal(answer)"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 text-sm font-medium"
                    >
                      Grade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grading Modal -->
    <Teleport to="body">
      <div
        v-if="showGradingModal && selectedAnswer"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="closeGradingModal"
      >
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <!-- Modal Header -->
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-xl font-semibold text-gray-900">Grade Essay Answer</h3>
              <button @click="closeGradingModal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>

            <!-- Question -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <p class="text-gray-900">{{ selectedAnswer.questionBody }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ selectedAnswer.questionPoints }} points</p>
            </div>

            <!-- Student Answer -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Student Answer</label>
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p class="text-gray-900 whitespace-pre-wrap">{{ selectedAnswer.studentAnswer }}</p>
              </div>
            </div>

            <!-- Grading Options -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-3">Grading</label>
              <div class="space-y-3">
                <!-- Full Credit -->
                <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                       :class="gradingMode === 'full' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'">
                  <input
                    type="radio"
                    v-model="gradingMode"
                    value="full"
                    class="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900">Full Credit</span>
                      <span class="text-green-600 font-semibold">{{ selectedAnswer.questionPoints }} pts</span>
                    </div>
                  </div>
                </label>

                <!-- Partial Credit -->
                <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                       :class="gradingMode === 'partial' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'">
                  <input
                    type="radio"
                    v-model="gradingMode"
                    value="partial"
                    class="w-4 h-4 text-blue-600 focus:ring-blue-500 mt-1"
                  />
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between mb-2">
                      <span class="font-medium text-gray-900">Partial Credit</span>
                    </div>
                    <div v-if="gradingMode === 'partial'" class="flex items-center gap-2">
                      <input
                        type="number"
                        v-model.number="partialPoints"
                        :min="0"
                        :max="selectedAnswer.questionPoints"
                        step="0.5"
                        class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span class="text-gray-600">/ {{ selectedAnswer.questionPoints }} points</span>
                    </div>
                  </div>
                </label>

                <!-- No Credit -->
                <label class="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                       :class="gradingMode === 'none' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'">
                  <input
                    type="radio"
                    v-model="gradingMode"
                    value="none"
                    class="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <div class="ml-3 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-gray-900">No Credit</span>
                      <span class="text-red-600 font-semibold">0 pts</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Feedback -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Feedback (Optional)</label>
              <textarea
                v-model="feedback"
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Provide feedback to the student..."
              ></textarea>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button
                @click="closeGradingModal"
                class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                @click="submitGrade"
                :disabled="gradingAnswerId === selectedAnswer.attemptAnswerId"
                class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="gradingAnswerId === selectedAnswer.attemptAnswerId">
                  <i class="fas fa-spinner fa-spin mr-2"></i>
                  Grading...
                </span>
                <span v-else>Submit Grade</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
