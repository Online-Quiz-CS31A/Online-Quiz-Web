<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/Header.vue'
import type { ScoreReviewQuestion } from '@/interfaces/interfaces'
import { useQuizzesStore } from '@/stores/quizzesStore'

// CONSTANTS
const router = useRouter()
const quizzesStore = useQuizzesStore()

const questions: ScoreReviewQuestion[] = quizzesStore.getScoreItems() as ScoreReviewQuestion[]

// REFS
const currentQuestion = ref(0)

// COMPUTED
const breadcrumb = computed(() => `Dashboard > Quizzes > Week 1 Quiz > Score`)

const scoreDetails = computed(() => quizzesStore.calculateScore())

const score = computed(() => {
  return `${scoreDetails.value.score}/${scoreDetails.value.totalPoints}`
})

const correctCount = computed(() => questions.filter(q => q.isCorrect).length)

const startedAtText = computed(() => {
  const iso = quizzesStore.currentAttempt.startAtISO
  return iso ? new Date(iso).toLocaleString() : '-'
})

const completedAtText = computed(() => {
  const iso = quizzesStore.currentAttempt.endAtISO
  return iso ? new Date(iso).toLocaleString() : '-'
})

// METHODS
const goToQuestion = (questionIndex: number) => {
  currentQuestion.value = questionIndex
}

const nextQuestion = () => {
  if (currentQuestion.value < questions.length - 1) {
    currentQuestion.value++
  }
}

const previousQuestion = () => {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
  }
}

const finishReview = () => {
  quizzesStore.saveAttemptToHistory()
  quizzesStore.clearAttemptStorage()
  
  const quizId = quizzesStore.currentAttempt.quizId
  if (quizId) {
    router.push({ name: 'student-prequiz', params: { quizId: quizId.toString() } })
  } else {
    router.push({ name: 'student' })
  }
}

const getQuestionButtonClass = (index: number) => {
  const question = questions[index]
  const isActive = currentQuestion.value === index
  
  if (isActive) {
    return question.isCorrect 
      ? 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
      : 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
  }
  
  return question.isCorrect 
    ? 'border-[#4ade80] bg-[#86efac] text-green-800 hover:bg-green-300'
    : 'border-[#f87171] bg-[#fca5a5] text-red-800 hover:bg-red-300'
}

const getOptionClass = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  if (isUserAnswer && isCorrectAnswer) {
    return 'bg-[#86efac] border-[#4ade80]'
  }
  if (isUserAnswer && !isCorrectAnswer) {
    return 'bg-[#fca5a5] border-[#f87171]'
  }
  if (isCorrectAnswer) {
    return 'bg-[#F4F7F9] border-[#4ade80]'
  }
  
  return 'bg-[#F4F7F9] border-[#7B90DF]'
}

const getOptionIconClass = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  if (isCorrectAnswer && isUserAnswer) {
    return 'bg-[#4ade80] border-[#4ade80] text-white'
  }
  if (isCorrectAnswer) {
    return 'bg-[#F4F7F9] border-[#4ade80] text-[#4ade80]'
  } else if (isUserAnswer) {
    return 'bg-[#f87171] border-[#f87171] text-white'
  }
  
  return 'bg-[#F4F7F9] border-[#7B90DF] text-black'
}

const showIcon = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isUserAnswer = question.userAnswer === optionIndex
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  return isUserAnswer || isCorrectAnswer
}

const getIconType = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  const isCorrectAnswer = question.correctAnswer === optionIndex
  
  return isCorrectAnswer ? 'check' : 'times'
}

const isCorrectOption = (optionIndex: number) => {
  const question = questions[currentQuestion.value]
  return question.correctAnswer === optionIndex
}

const isShortAnswerCorrect = (answer: any) => {
  if (!answer) return false
  const text = String(answer).trim()
  if (!text) return false
  const sentences = text
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(Boolean)

  if (sentences.length < 2 || sentences.length > 3) return false

  const allSentencesLongEnough = sentences.every(sentence => {
    const words = sentence
      .split(/\s+/)
      .map(w => w.trim())
      .filter(Boolean)
    return words.length >= 3
  })

  return allSentencesLongEnough
}

const getQuestionScore = (index: number) => {
  const q = questions[index]
  if (!q) {
    return { earned: 0, total: 0 }
  }

  const basePoints = q.points || 0
  let total = basePoints
  let earned = 0

  if (q.questionType === 'matching' && Array.isArray(q.matchingPairs) && q.matchingPairs.length > 0) {
    total = basePoints * q.matchingPairs.length
    const correctCount = q.matchingPairs.filter(p => p.isCorrect).length
    earned = basePoints * correctCount
    return { earned, total }
  }

  if (q.questionType === 'enumeration' && Array.isArray(q.options) && q.options.length > 0) {
    const items = q.options
    total = basePoints * items.length

    const userItems: string[] = Array.isArray(q.userAnswer)
      ? (q.userAnswer as any[]).map(v => (v != null ? String(v) : ''))
      : []

    const normalize = (text: string) => text.trim().toLowerCase()
    const correctNormalized = items.map(item => normalize(String(item || ''))).filter(Boolean)
    const userNormalized = userItems.map(item => normalize(String(item || ''))).filter(Boolean)

    const userSet = new Set(userNormalized)

    let correctItemCount = 0
    const counted = new Set<string>()
    correctNormalized.forEach(val => {
      if (userSet.has(val) && !counted.has(val)) {
        correctItemCount += 1
        counted.add(val)
      }
    })

    earned = basePoints * correctItemCount
    return { earned, total }
  }

  if (q.questionType === 'fill-blank') {
    total = basePoints
    earned = q.isCorrect ? basePoints : 0
    return { earned, total }
  }

  if (q.questionType === 'short-answer') {
    total = basePoints
    earned = isShortAnswerCorrect(q.userAnswer) ? basePoints : 0
    return { earned, total }
  }

  if ((q.questionType === 'multiple-choice' || q.questionType === 'true-false' || !q.questionType) && Array.isArray(q.options) && q.options.length > 0) {
    total = basePoints
    if (q.userAnswer !== null && q.userAnswer !== undefined && q.userAnswer === q.correctAnswer) {
      earned = basePoints
    }
    return { earned, total }
  }

  total = basePoints
  earned = q.isCorrect ? basePoints : 0
  return { earned, total }
}

const isEnumerationItemCorrect = (itemIndex: number) => {
  const q = questions[currentQuestion.value]
  if (!q || !Array.isArray(q.options)) return false

  const items = q.options
  const userItems: string[] = Array.isArray(q.userAnswer)
    ? (q.userAnswer as any[]).map(v => (v != null ? String(v) : ''))
    : []

  const normalize = (text: string) => text.trim().toLowerCase()
  const correctSet = new Set(items.map(item => normalize(String(item || ''))).filter(Boolean))

  const raw = userItems[itemIndex] != null ? String(userItems[itemIndex]) : ''
  const userTrim = normalize(raw)

  if (!userTrim) return false
  if (correctSet.size === 0) return false

  return correctSet.has(userTrim)
}
</script>

<template>
  <div class="min-h-screen">
    <Header :breadcrumb="breadcrumb" />
    
    <div class="max-w-6xl mx-auto p-4 mt-8">
      <!-- Quiz Header Info -->
      <div class="mb-6 flex items-start gap-6">
        <!-- Title Block -->
        <div class="shrink-0">
          <h1 class="text-3xl font-bold text-[#4285f4] leading-tight">Week 1 Quiz</h1>
          <p class="text-base text-gray-800">Business Math</p>
        </div>

        <!-- Info Box -->
        <div class="flex-1 min-w-[420px]">
          <div class="rounded-2xl border border-[#D7E8FF] overflow-hidden">
            <!-- Row 1 -->
            <div class="grid grid-cols-2 divide-x divide-[#D7E8FF]">
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Status:</span>
                <span class="ml-2 text-gray-800">Finished</span>
              </div>
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Started:</span>
                <span class="ml-2 text-gray-800">{{ startedAtText }}</span>
              </div>
            </div>
            <!-- Row 2 -->
            <div class="grid grid-cols-2 divide-x divide-[#D7E8FF] border-t border-[#D7E8FF]">
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Score:</span>
                <span class="ml-2 text-gray-800">{{ score }}</span>
              </div>
              <div class="px-6 py-3 text-sm">
                <span class="text-[#4285f4] font-semibold">Completed:</span>
                <span class="ml-2 text-gray-800">{{ completedAtText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="grid grid-cols-3 gap-6">
        <!-- Left Panel -->
        <div class="col-span-2">
          <div class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] relative">
            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-800">Question {{ currentQuestion + 1 }}</h2>
                <span class="text-sm font-semibold text-[#4285f4]">
                  Score:
                  {{ getQuestionScore(currentQuestion).earned }}
                  /
                  {{ getQuestionScore(currentQuestion).total }}
                </span>
              </div>
              <p class="text-base text-gray-700 leading-relaxed mb-6">{{ questions[currentQuestion].question }}</p>
            </div>
            
            <div class="space-y-3">
              <!-- Multiple Choice / True-False Rendering -->
              <template v-if="questions[currentQuestion].questionType === 'multiple-choice' || questions[currentQuestion].questionType === 'true-false' || !questions[currentQuestion].questionType">
                <div 
                  v-for="(option, index) in questions[currentQuestion].options" 
                  :key="index"
                  :class="[
                    'relative flex items-center p-2 rounded-xl transition-all border-1',
                    getOptionClass(index)
                  ]"
                >
                  <div 
                    v-if="isCorrectOption(index) && questions[currentQuestion].userAnswer !== index" 
                    class="absolute -top-3 left-3 bg-white text-[#16a34a] border border-[#4ade80] rounded-md px-2 py-0.5 text-xs font-semibold"
                  >
                    Correct
                  </div>
                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div 
                      :class="[
                        'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                        getOptionIconClass(index)
                      ]"
                    >
                      <i 
                        v-if="showIcon(index)" 
                        :class="['fas', `fa-${getIconType(index)}`,'text-xs']"
                      ></i>
                      <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                    </div>
                  </div>
                  <span 
                    :class="[
                      'text-base font-medium',
                      questions[currentQuestion].userAnswer === index ? 'text-[#4866DA]' : 'text-gray-800'
                    ]"
                  >{{ option }}</span>
                </div>
              </template>

              <!-- Enumeration Rendering -->
              <template v-else-if="questions[currentQuestion].questionType === 'enumeration'">
                <div class="space-y-3">
                  <div
                    v-for="(_, index) in (questions[currentQuestion].options || [])"
                    :key="index"
                    class="flex items-center gap-3"
                  >
                    <span class="text-gray-600 font-medium">{{ index + 1 }}.</span>
                    <div
                      :class="[
                        'flex-1 p-3 rounded-xl border-2 flex items-center',
                        isEnumerationItemCorrect(index)
                          ? 'bg-[#86efac] border-[#4ade80] text-green-900'
                          : 'bg-[#fca5a5] border-[#f87171] text-black'
                      ]"
                    >
                      <div class="mr-4 flex items-center justify-center w-8 h-8">
                        <div
                          :class="[
                            'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                            isEnumerationItemCorrect(index)
                              ? 'bg-[#4ade80] border-[#4ade80] text-white'
                              : 'bg-[#f87171] border-[#f87171] text-white'
                          ]"
                        >
                          <i
                            :class="[
                              'fas',
                              isEnumerationItemCorrect(index) ? 'fa-check' : 'fa-times',
                              'text-xs'
                            ]"
                          ></i>
                        </div>
                      </div>

                      <div class="flex flex-col text-sm">
                        <span class="font-medium text-gray-800">
                          Your answer:
                          <span
                            v-if="
                              (questions[currentQuestion].userAnswer || [])[index] &&
                              String((questions[currentQuestion].userAnswer || [])[index]).trim() !== ''
                            "
                          >
                            {{ (questions[currentQuestion].userAnswer || [])[index] }}
                          </span>
                          <span v-else class="italic">(unanswered)</span>
                        </span>
                        <span
                          v-if="!isEnumerationItemCorrect(index) && (questions[currentQuestion].options || [])[index]"
                          class="text-xs text-[#16a34a] mt-1"
                        >
                          Correct: {{ (questions[currentQuestion].options || [])[index] || '' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Fill in the Blank Rendering -->
              <template v-else-if="questions[currentQuestion].questionType === 'fill-blank'">
                <div
                  v-if="!questions[currentQuestion].isCorrect"
                  class="mt-3 text-sm"
                >
                  <span class="font-semibold text-[#16a34a]">Correct answer: </span>
                  <span class="font-semibold text-gray-800">
                    {{ questions[currentQuestion].correctAnswerText || '' }}
                  </span>
                </div>
                <div
                  :class="[
                    'flex items-center p-2 rounded-xl transition-all border-1',
                    questions[currentQuestion].isCorrect
                      ? 'bg-[#86efac] border-[#4ade80]'
                      : 'bg-[#fca5a5] border-[#f87171]'
                  ]"
                >
                
                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                        questions[currentQuestion].isCorrect
                          ? 'bg-[#4ade80] border-[#4ade80] text-white'
                          : 'bg-[#f87171] border-[#f87171] text-white'
                      ]"
                    >
                      <i
                        :class="[
                          'fas',
                          questions[currentQuestion].isCorrect ? 'fa-check' : 'fa-times',
                          'text-xs'
                        ]"
                      ></i>
                    </div>
                  </div>

                  
                  <span class="text-base font-medium text-gray-800">
                    {{
                      questions[currentQuestion].userAnswer &&
                      String(questions[currentQuestion].userAnswer).trim() !== ''
                        ? questions[currentQuestion].userAnswer
                        : ''
                    }}
                    <span
                      v-if="!(questions[currentQuestion].userAnswer && String(questions[currentQuestion].userAnswer).trim() !== '')"
                      class="italic"
                    >(unanswered)</span>
                  </span>
                </div>
              </template>

              <!-- Short Answer Rendering -->
              <template v-else-if="questions[currentQuestion].questionType === 'short-answer'">
                <div
                  v-if="!isShortAnswerCorrect(questions[currentQuestion].userAnswer)"
                  class="mb-2 text-sm"
                >
                  <span class="font-semibold text-[#16a34a]">Correct answer:</span>
                  <span class="font-semibold text-gray-800">
                    answer must be 2-3 sentences
                  </span>
                </div>

                <div
                  :class="[
                    'flex items-center p-2 rounded-xl transition-all border-1',
                    isShortAnswerCorrect(questions[currentQuestion].userAnswer)
                      ? 'bg-[#86efac] border-[#4ade80]'
                      : 'bg-[#fca5a5] border-[#f87171]'
                  ]"
                >
                  <div class="mr-4 flex items-center justify-center w-8 h-8">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                        isShortAnswerCorrect(questions[currentQuestion].userAnswer)
                          ? 'bg-[#4ade80] border-[#4ade80] text-white'
                          : 'bg-[#f87171] border-[#f87171] text-white'
                      ]"
                    >
                      <i
                        :class="[
                          'fas',
                          isShortAnswerCorrect(questions[currentQuestion].userAnswer)
                            ? 'fa-check'
                            : 'fa-times',
                          'text-xs'
                        ]"
                      ></i>
                    </div>
                  </div>
                  <span class="text-base font-medium text-gray-800">
                    <template
                      v-if="
                        questions[currentQuestion].userAnswer &&
                        String(questions[currentQuestion].userAnswer).trim() !== ''
                      "
                    >
                      {{ questions[currentQuestion].userAnswer }}
                    </template>
                    <span
                      v-else
                      class="italic"
                    >(unanswered)</span>
                  </span>
                </div>
              </template>

              <!-- Matching Rendering -->
              <template v-else-if="questions[currentQuestion].questionType === 'matching'">
                <div>
                  <div class="grid grid-cols-2 gap-6 mb-3">
                    <h3 class="font-semibold text-gray-700">Column A</h3>
                    <h3 class="font-semibold text-gray-700">Match with</h3>
                  </div>

                  <div
                    v-for="(pair, index) in (questions[currentQuestion].matchingPairs || [])"
                    :key="index"
                    class="grid grid-cols-2 gap-6 mb-2 items-stretch"
                  >
                    <!-- Column A -->
                    <div class="h-full">
                      <div class="h-full flex items-center p-3 bg-[#F4F7F9] border border-[#7B90DF] rounded-lg">
                        {{ index + 1 }}. {{ pair.left }}
                      </div>
                    </div>

                    <!-- Column B -->
                    <div class="h-full">
                      <div
                        :class="[
                          'h-full flex items-center p-2 rounded-xl transition-all border-1',
                          pair.isCorrect
                            ? 'bg-[#86efac] border-[#4ade80]'
                            : 'bg-[#fca5a5] border-[#f87171]'
                        ]"
                      >
                        <div class="mr-4 flex items-center justify-center w-8 h-8">
                          <div
                            :class="[
                              'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                              pair.isCorrect
                                ? 'bg-[#4ade80] border-[#4ade80] text-white'
                                : 'bg-[#f87171] border-[#f87171] text-white'
                            ]"
                          >
                            <i
                              :class="[
                                'fas',
                                pair.isCorrect ? 'fa-check' : 'fa-times',
                                'text-xs'
                              ]"
                            ></i>
                          </div>
                        </div>

                        <div class="flex flex-col text-sm">
                          <span class="font-medium text-gray-800">
                            Your answer:
                            <span v-if="pair.userRight && pair.userRight.trim() !== ''">
                              {{ pair.userRight }}
                            </span>
                            <span v-else class="italic">(unanswered)</span>
                          </span>
                          <span v-if="!pair.isCorrect" class="text-xs text-[#16a34a] mt-1">
                            Correct: {{ pair.right }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Fallback for other types -->
              <template v-else>
                <div class="flex items-center p-2 rounded-xl transition-all border-1 bg-[#F4F7F9] border-[#7B90DF]">
                  <span class="text-base font-medium text-gray-800">
                    {{ questions[currentQuestion].options[0] || '(answer recorded)' }}
                  </span>
                </div>
              </template>
            </div>
          </div>
          
          <!-- Navigation buttons below quiz container -->
          <div class="flex gap-3 justify-center mt-6">
            <button 
              class="px-8 py-2 bg-[#F4F7F9] text-black border border-[#7B90DF] rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              @click="previousQuestion"
              :disabled="currentQuestion === 0"
            >
              Previous
            </button>
            <button 
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="nextQuestion"
              :disabled="currentQuestion === questions.length - 1"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="col-span-1">
          <div class="bg-[#F4F7F9] rounded-xl shadow-sm p-4">
            <div class="mb-4">
              <p class="text-sm font-medium text-gray-600 text-right">Question {{ currentQuestion + 1 }} of {{ questions.length }}</p>
            </div>
            <div class="grid grid-cols-5 gap-3">
              <button 
                v-for="(question, index) in questions" 
                :key="index"
                :class="[
                  'w-10 h-10 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all',
                  getQuestionButtonClass(index)
                ]"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </button>
            </div>
            
            <!-- Finish Review Button -->
            <div class="mt-6 pt-4 border-t border-gray-300">
              <button 
                @click="finishReview"
                class="w-full px-4 py-2 bg-white border border-[#7B90DF] text-[#4285f4] rounded-xl font-medium hover:bg-[#F4F7F9] transition-all flex items-center justify-center gap-2"
              >
                <span>Finish Review</span>
                <i class="fas fa-arrow-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
