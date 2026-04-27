<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useQuizzesStore } from '@/stores/quizzesStore'

const router = useRouter()
const quizzesStore = useQuizzesStore()

const questions = computed(() => quizzesStore.currentQuiz.questions || [])
const quizTitle = computed(() => quizzesStore.currentQuiz.title || 'Quiz Preview')
const quizSubject = computed(() => quizzesStore.currentQuiz.subject || '')
const breadcrumb = computed(() => `Dashboard > Create Quiz > Preview`)

const currentQuestion = ref(0)
const selectedOption = ref<number | null>(null)
const textAnswer = ref('')
const enumerationAnswers = ref<string[]>([])
const matchingAnswers = ref<Record<number, number>>({})
const fillBlankAnswers = ref<string[]>([])
const showAnswers = ref(false)

const hasQuestions = computed(() => questions.value.length > 0)
const progress = computed(() => {
  if (!questions.value.length) return 0
  return ((currentQuestion.value + 1) / questions.value.length) * 100
})

function clearAnswers() {
  selectedOption.value = null
  textAnswer.value = ''
  enumerationAnswers.value = []
  matchingAnswers.value = {}
  fillBlankAnswers.value = []
}

function goToQuestion(index: number) {
  if (index < 0 || index >= questions.value.length) return
  currentQuestion.value = index
  clearAnswers()
}

function previousQuestion() {
  if (currentQuestion.value > 0) {
    currentQuestion.value--
    clearAnswers()
  }
}

function nextQuestion() {
  if (currentQuestion.value < questions.value.length - 1) {
    currentQuestion.value++
    clearAnswers()
  }
}

function closePreview() {
  const current = router.currentRoute.value
  const id = current.params.id as string | undefined

  if (id) {
    router.push({ name: 'quiz-builder', params: { id } })
  } else {
    router.back()
  }
}
</script>

<template>
  <div class="min-h-screen">
    <AppHeader :breadcrumb="breadcrumb" />

    <div class="max-w-6xl mx-auto p-4 mt-8">
      <!-- Quiz AppHeader -->
      <div v-if="hasQuestions" class="mb-6 flex items-baseline justify-between">
        <div>
          <h1 class="text-3xl font-bold text-[#4285f4] leading-tight">{{ quizTitle }}</h1>
          <p v-if="quizSubject" class="text-base text-gray-800">{{ quizSubject }}</p>
        </div>
      </div>

      <!-- No Questions State -->
      <div v-if="!hasQuestions" class="flex flex-col items-center justify-center min-h-[400px] text-center">
        <i class="fas fa-exclamation-circle text-5xl text-yellow-500 mb-4"></i>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">No questions to preview</h2>
        <p class="text-gray-600 mb-4 max-w-md">
          Add at least one question to your quiz, then return here to see how it will look for students.
        </p>
        <button
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          @click="closePreview"
        >
          Back to Quiz Builder
        </button>
      </div>

      <!-- Main Preview Content -->
      <main v-else class="grid grid-cols-3 gap-6">
        <!-- Left Panel -->
        <div class="col-span-2">
          <div class="bg-white rounded-3xl shadow-sm p-8 border-2 border-[#4285f4] relative">
            <!-- Student Preview Pill -->
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div class="bg-[#4285f4] text-white px-6 py-2 rounded-full text-sm font-semibold shadow">
                Student Preview
              </div>
            </div>
            <!-- Question AppHeader and Show Answers toggle -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-lg font-semibold text-gray-800">
                  Question {{ currentQuestion + 1 }}
                </h2>
                <div class="flex items-center gap-3">
                  <span class="text-sm text-gray-600">Show answers</span>
                  <button
                    type="button"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    :class="showAnswers ? 'bg-green-500' : 'bg-gray-300'"
                    @click="showAnswers = !showAnswers"
                  >
                    <span
                      class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform"
                      :class="showAnswers ? 'translate-x-5' : 'translate-x-1'"
                    />
                  </button>
                </div>
              </div>
              <p class="text-base text-gray-700 leading-relaxed mb-4">
                {{ questions[currentQuestion].text || (questions[currentQuestion] as any).body }}
              </p>
              <div v-if="questions[currentQuestion].mediaUrl" class="mb-4">
                <img
                  :src="questions[currentQuestion].mediaUrl"
                  alt="Question image"
                  class="w-full max-h-80 object-contain rounded-2xl border border-gray-200"
                />
              </div>
            </div>

            <!-- Multiple Choice / True-False -->
            <div
              v-if="['multiple-choice', 'true-false', 'Single', 'Multiple'].includes(questions[currentQuestion].type)"
              class="space-y-3"
            >
              <div
                v-for="(option, index) in (questions[currentQuestion].options || (questions[currentQuestion] as any).choices || [])"
                :key="index"
                :class="[
                  'relative flex items-center p-2 rounded-xl transition-all border-1',
                  showAnswers && (option as any).isCorrect
                    ? 'bg-[#86efac] border-[#4ade80]'
                    : 'bg-[#F4F7F9] border-[#7B90DF]'
                ]"
              >
                <div class="mr-4 flex items-center justify-center w-8 h-8">
                  <div
                    :class="[
                      'w-6 h-6 rounded-full border-1 flex items-center justify-center text-sm font-semibold',
                      showAnswers && (option as any).isCorrect
                        ? 'bg-[#4ade80] border-[#4ade80] text-white'
                        : 'bg-[#F4F7F9] border-[#7B90DF] text-black'
                    ]"
                  >
                    <i
                      v-if="showAnswers && (option as any).isCorrect"
                      class="fas fa-check text-xs"
                    ></i>
                    <span v-else>{{ String.fromCharCode(65 + index) }}</span>
                  </div>
                </div>
                <span
                  :class="[
                    'text-base font-medium',
                    showAnswers && (option as any).isCorrect ? 'text-green-900' : 'text-gray-800'
                  ]"
                >
                  {{ (option && 'text' in option) ? (option as any).text : (option && 'body' in option ? (option as any).body : option) }}
                </span>
              </div>
            </div>

            <!-- Text -->
            <div v-else-if="questions[currentQuestion].type === 'text' || questions[currentQuestion].type === 'Text'" class="space-y-3">
              <textarea
                :value="showAnswers && questions[currentQuestion].correctAnswer
                  ? questions[currentQuestion].correctAnswer
                  : ''"
                readonly
                :class="[
                  'w-full p-4 border-2 rounded-xl focus:outline-none resize-none cursor-default',
                  showAnswers && questions[currentQuestion].correctAnswer
                    ? 'bg-[#86efac] border-[#4ade80] text-green-900'
                    : 'bg-gray-50 border-[#7B90DF]'
                ]"
                rows="6"
                placeholder="Type your answer here"
              ></textarea>
            </div>

            <!-- Enumeration -->
            <div v-else-if="questions[currentQuestion].type === 'enumeration' || questions[currentQuestion].type === 'Enumeration'" class="space-y-3">
              <div
                v-for="(item, index) in (((questions[currentQuestion] as any)?.items) || [])"
                :key="index"
                class="flex flex-col gap-1"
              >
                <div class="flex items-center gap-3">
                  <span class="text-gray-600 font-medium">{{ Number(index) + 1 }}.</span>
                  <input
                    type="text"
                    :value="showAnswers && item && String(item).trim() !== '' ? item : ''"
                    readonly
                    :class="[
                      'flex-1 p-3 border-2 rounded-xl focus:outline-none cursor-default',
                      showAnswers && item && String(item).trim() !== ''
                        ? 'bg-[#86efac] border-[#4ade80] text-green-900'
                        : 'bg-gray-50 border-[#7B90DF]'
                    ]"
                    :placeholder="`Item ${Number(index) + 1}`"
                  />
                </div>
              </div>
            </div>

            <!-- Matching (read-only) -->
            <div v-else-if="questions[currentQuestion].type === 'matching' || questions[currentQuestion].type === 'Matching'" class="space-y-3">
              <div class="grid grid-cols-2 gap-6">
                <!-- Column A -->
                <div>
                  <h3 class="font-semibold text-gray-700 mb-3">Column A</h3>
                  <div
                    v-for="(pair, index) in ((questions[currentQuestion] as any).pairs || [])"
                    :key="index"
                    class="mb-2 p-3 bg-[#F4F7F9] border border-[#7B90DF] rounded-lg"
                  >
                    {{ Number(index) + 1 }}. {{ pair.left }}
                  </div>
                </div>

                <!-- Column B -->
                <div>
                  <h3 class="font-semibold text-gray-700 mb-3">Column B</h3>
                  <div
                    v-for="(pair, leftIndex) in ((questions[currentQuestion] as any).pairs || [])"
                    :key="leftIndex"
                    class="mb-2"
                  >
                    <select
                      v-model="matchingAnswers[leftIndex]"
                      disabled
                      :class="[
                        'w-full p-3 border-2 rounded-xl cursor-default',
                        showAnswers && pair.right && String(pair.right).trim() !== ''
                          ? 'bg-[#86efac] border-[#4ade80] text-green-900'
                          : 'bg-gray-50 border-[#7B90DF]'
                      ]"
                    >
                      <option value="">Select answer...</option>
                      <option
                        v-for="(rightPair, rightIndex) in ((questions[currentQuestion] as any).pairs || [])"
                        :key="rightIndex"
                        :value="Number(rightIndex)"
                      >
                        {{ String.fromCharCode(65 + Number(rightIndex)) }}. {{ rightPair.right }}
                      </option>
                    </select>
                    <p
                      v-if="showAnswers && pair.right && String(pair.right).trim() !== ''"
                      class="text-xs text-green-700 mt-1"
                    >
                      Correct: {{ pair.right }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fill in the Blank (read-only) -->
            <div v-else-if="questions[currentQuestion].type === 'fill-blank' || questions[currentQuestion].type === 'FillBlank'" class="space-y-3">
              <div
                v-for="(blank, index) in (((questions[currentQuestion] as any)?.blanks) || Array(1).fill({}))"
                :key="index"
                class="flex flex-col gap-1"
              >
                <div class="flex items-center gap-3">
                  <span class="text-gray-600 font-medium">Blank {{ Number(index) + 1 }}:</span>
                  <input
                    type="text"
                    v-model="fillBlankAnswers[Number(index)]"
                    readonly
                    class="flex-1 p-3 border-2 border-[#7B90DF] rounded-xl bg-gray-50 focus:outline-none cursor-default"
                    :placeholder="`Fill in blank ${Number(index) + 1}`"
                  />
                </div>
              </div>
              <p
                v-if="showAnswers && questions[currentQuestion].correctAnswer"
                class="text-sm text-green-700"
              >
                Correct answer: {{ questions[currentQuestion].correctAnswer }}
              </p>
            </div>
          </div>

          <!-- Navigation -->
          <div class="flex gap-3 justify-center mt-6">
            <button
              class="px-8 py-2 bg-[#F4F7F9] text-black border border-[#7B90DF] rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              @click="previousQuestion"
              :disabled="currentQuestion === 0"
            >
              Previous
            </button>
            <button
              v-if="currentQuestion < questions.length - 1"
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="nextQuestion"
            >
              Next
            </button>
            <button
              v-else
              class="px-8 py-2 bg-[#C9E4F6] border border-[#7B90DF] text-[#4D74FF] rounded-xl font-medium transition-all disabled:opacity-50"
              @click="closePreview"
            >
              Close Preview
            </button>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="col-span-1">
          <div class="bg-[#F4F7F9] rounded-xl shadow-sm p-4">
            <div class="mb-4">
              <p class="text-sm text-gray-600 mb-2 text-right font-medium">
                Question {{ currentQuestion + 1 }} of {{ questions.length }}
              </p>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  class="h-full bg-[#4285f4] rounded-full transition-all duration-300"
                  :style="{ width: progress + '%' }"
                ></div>
              </div>
            </div>
            <div class="grid grid-cols-5 gap-3">
              <button
                v-for="questionIndex in questions.length"
                :key="questionIndex"
                :class="[
                  'w-10 h-10 border-2 rounded-lg font-semibold text-sm cursor-pointer transition-all',
                  currentQuestion === questionIndex - 1
                    ? 'border-[#4285f4] bg-[#e3f2fd] text-[#1976d2]'
                    : 'border-[#4D74FF] bg-[#F4F7F9] text-gray-600 hover:bg-gray-50'
                ]"
                @click="goToQuestion(questionIndex - 1)"
              >
                {{ questionIndex }}
              </button>
            </div>

            <!-- Close Preview Button (quick nav) -->
            <div class="mt-6 pt-4 border-t border-gray-300">
              <button
                @click="closePreview"
                class="w-full px-4 py-2 bg-white border border-[#7B90DF] text-[#4285f4] rounded-xl font-medium hover:bg-[#F4F7F9] transition-all flex items-center justify-center gap-2"
              >
                <span>Close Preview</span>
                <i class="fas fa-arrow-right text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
