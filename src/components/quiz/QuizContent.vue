<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { QuestionOption, MatchingPair, QuizQuestion } from '@/interfaces/interfaces'

const route = useRoute()
const router = useRouter()
const classId = computed(() => String(route.params.id || ''))

function getOptionLetter(index: number) {
  const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return base[index] || String(index + 1)
}

const quiz = reactive({
  title: '',
  subject: '',
  timeLimit: '',
  description: '',
  questions: [] as QuizQuestion[],
  currentQuestionIndex: -1
})

const showAddQuestionModal = ref(false)
const showMediaUpload = ref(false)
const openMenuIndex = ref<number | null>(null)

const questionSettings = reactive({
  type: 'multiple-choice',
  points: 1,
  mediaType: 'none',
  required: false
})

const currentQuestion = computed(() => {
  if (quiz.currentQuestionIndex === -1) return null
  return quiz.questions[quiz.currentQuestionIndex]
})

const hasQuestions = computed(() => quiz.questions.length > 0)

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice', icon: 'fas fa-list-ul' },
  { value: 'true-false', label: 'True/False', icon: 'fas fa-check' },
  { value: 'fill-blank', label: 'Fill in the Blank', icon: 'fas fa-pencil-alt' },
  { value: 'short-answer', label: 'Short Answer', icon: 'fas fa-align-left' },
  { value: 'matching', label: 'Matching', icon: 'fas fa-random' },
  { value: 'enumeration', label: 'Enumeration', icon: 'fas fa-list-ol' },
  { value: 'image-question', label: 'Image Question', icon: 'fas fa-image' },
  { value: 'essay', label: 'Essay', icon: 'fas fa-pen-fancy' }
]

function openAddQuestionModal() {
  showAddQuestionModal.value = true
}

function closeAddQuestionModal() {
  showAddQuestionModal.value = false
}

function addQuestion(type: string) {
  const newQuestion: QuizQuestion = {
    id: Date.now(),
    type: type,
    text: '',
    points: 1,
    mediaType: 'none',
    mediaUrl: '',
    required: false,
    options: [],
    correctAnswer: '',
    pairs: [],
    items: []
  }

  switch(type) {
    case 'multiple-choice':
      newQuestion.options = [
        { text: 'Option 1', isCorrect: true, imageUrl: '' },
        { text: 'Option 2', isCorrect: false, imageUrl: '' },
        { text: 'Option 3', isCorrect: false, imageUrl: '' },
        { text: 'Option 4', isCorrect: false, imageUrl: '' }
      ]
      break
    case 'true-false':
      newQuestion.options = [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ]
      break
    case 'matching':
      newQuestion.pairs = [
        { left: 'Term 1', right: 'Definition 1' },
        { left: 'Term 2', right: 'Definition 2' }
      ]
      break
    case 'enumeration':
      newQuestion.items = ['Item 1', 'Item 2']
      break
    case 'image-question':
      newQuestion.mediaType = 'image'
      break
  }

  quiz.questions.push(newQuestion)
  selectQuestion(quiz.questions.length - 1)
  closeAddQuestionModal()
}

function selectQuestion(index: number) {
  quiz.currentQuestionIndex = index
  openMenuIndex.value = null
  if (currentQuestion.value) {
    questionSettings.type = currentQuestion.value.type
    questionSettings.points = currentQuestion.value.points
    questionSettings.mediaType = currentQuestion.value.mediaType
    questionSettings.required = currentQuestion.value.required
  }
}

function deleteCurrentQuestion() {
  if (quiz.currentQuestionIndex === -1) return
  
  if (confirm('Are you sure you want to delete this question?')) {
    quiz.questions.splice(quiz.currentQuestionIndex, 1)
    
    if (quiz.questions.length === 0) {
      quiz.currentQuestionIndex = -1
    } else {
      quiz.currentQuestionIndex = Math.max(0, quiz.currentQuestionIndex - 1)
    }
  }
}

function addOption() {
  if (currentQuestion.value && currentQuestion.value.options) {
    currentQuestion.value.options.push({
      text: `Option ${currentQuestion.value.options.length + 1}`,
      isCorrect: false,
      imageUrl: ''
    })
  }
}

function onOptionImageChange(index: number, e: Event) {
  if (!currentQuestion.value) return
  const input = (e.target as HTMLInputElement)
  const file = input.files && input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const result = reader.result as string
    if (currentQuestion.value) {
      currentQuestion.value.options[index].imageUrl = result
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function autoResizeTextarea(e: Event) {
  const target = e.target as HTMLTextAreaElement
  if (!target) return
  target.style.height = 'auto'
  target.style.height = `${target.scrollHeight}px`
}

function removeOption(index: number) {
  if (currentQuestion.value && currentQuestion.value.options) {
    currentQuestion.value.options.splice(index, 1)
  }
}

function addPair() {
  if (currentQuestion.value && currentQuestion.value.pairs) {
    const pairCount = currentQuestion.value.pairs.length + 1
    currentQuestion.value.pairs.push({
      left: `Term ${pairCount}`,
      right: `Definition ${pairCount}`
    })
  }
}

function removePair(index: number) {
  if (currentQuestion.value && currentQuestion.value.pairs) {
    currentQuestion.value.pairs.splice(index, 1)
  }
}

function addItem() {
  if (currentQuestion.value && currentQuestion.value.items) {
    currentQuestion.value.items.push(`Item ${currentQuestion.value.items.length + 1}`)
  }
}

function removeItem(index: number) {
  if (currentQuestion.value && currentQuestion.value.items) {
    currentQuestion.value.items.splice(index, 1)
  }
}

function duplicateCurrentQuestion() {
  if (!currentQuestion.value) return
  const clone = JSON.parse(JSON.stringify(currentQuestion.value)) as Question
  clone.id = Date.now()
  quiz.questions.splice(quiz.currentQuestionIndex + 1, 0, clone)
  selectQuestion(quiz.currentQuestionIndex + 1)
}

function toggleQuestionMenu(index: number) {
  openMenuIndex.value = openMenuIndex.value === index ? null : index
}

function duplicateQuestion(index: number) {
  const q = quiz.questions[index]
  if (!q) return
  const clone = JSON.parse(JSON.stringify(q)) as Question
  clone.id = Date.now()
  quiz.questions.splice(index + 1, 0, clone)
  openMenuIndex.value = null
  selectQuestion(index + 1)
}

function deleteQuestion(index: number) {
  if (index < 0 || index >= quiz.questions.length) return
  if (confirm('Are you sure you want to delete this question?')) {
    quiz.questions.splice(index, 1)
    if (quiz.questions.length === 0) {
      quiz.currentQuestionIndex = -1
    } else if (quiz.currentQuestionIndex >= index) {
      quiz.currentQuestionIndex = Math.max(0, quiz.currentQuestionIndex - 1)
    }
  }
  openMenuIndex.value = null
}

function moveQuestion(direction: 'up' | 'down') {
  const idx = quiz.currentQuestionIndex
  if (idx === -1) return
  const newIndex = direction === 'up' ? idx - 1 : idx + 1
  if (newIndex < 0 || newIndex >= quiz.questions.length) return
  const [q] = quiz.questions.splice(idx, 1)
  quiz.questions.splice(newIndex, 0, q)
  selectQuestion(newIndex)
}

function shuffleOptions() {
  if (!currentQuestion.value || !currentQuestion.value.options) return
  currentQuestion.value.options = [...currentQuestion.value.options]
    .map(v => ({ sort: Math.random(), value: v }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

function onQuestionMediaChange(e: Event) {
  if (!currentQuestion.value) return
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (currentQuestion.value) currentQuestion.value.mediaUrl = String(reader.result)
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function clearQuestionMedia() {
  if (!currentQuestion.value) return
  currentQuestion.value.mediaUrl = ''
}

function updateQuestionType() {
  if (!currentQuestion.value) return
  
  const newType = questionSettings.type
  if (currentQuestion.value.type === newType) return
  
  currentQuestion.value.type = newType
  currentQuestion.value.options = []
  currentQuestion.value.pairs = []
  currentQuestion.value.items = []
  currentQuestion.value.correctAnswer = ''
  
  addQuestion(newType)
  quiz.questions.pop() 
}

function goBack() {
  router.push(`/teacher/classes/${classId.value}/dashboard`)
}

function goToContent() {
  const el = document.querySelector('#quiz-main-content') as HTMLElement | null
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function openAssign() {
  alert('Open assign flow (to be implemented)')
}

function viewResults() {
  router.push({ name: 'quiz-results-dashboard', params: { id: classId.value } })
}

function getQuestionTypeDescription(type: string) {
  const descriptions: Record<string, string> = {
    'multiple-choice': 'Question with multiple possible answers',
    'true-false': 'Question with true or false options',
    'fill-blank': 'Question with blank spaces to fill',
    'short-answer': 'Question requiring a short text answer',
    'matching': 'Question to match items from two columns',
    'enumeration': 'Question requiring a list of items',
    'image-question': 'Question based on an image',
    'essay': 'Question requiring a long-form answer'
  }
  return descriptions[type] || ''
}

watch(() => questionSettings.type, updateQuestionType)
watch(() => questionSettings.points, (newPoints) => {
  if (currentQuestion.value) {
    currentQuestion.value.points = newPoints
  }
})
watch(() => questionSettings.mediaType, (newMediaType) => {
  if (currentQuestion.value) {
    currentQuestion.value.mediaType = newMediaType
  }
  showMediaUpload.value = newMediaType !== 'none'
})
watch(() => questionSettings.required, (newRequired) => {
  if (currentQuestion.value) {
    currentQuestion.value.required = newRequired
  }
})

function getQuestionIcon(type: string) {
  const map: Record<string, string> = {
    'multiple-choice': 'fas fa-list-ul',
    'true-false': 'fas fa-check',
    'fill-blank': 'fas fa-pencil-alt',
    'short-answer': 'fas fa-align-left',
    'matching': 'fas fa-random',
    'enumeration': 'fas fa-list-ol',
    'image-question': 'fas fa-image',
    'essay': 'fas fa-pen-fancy',
  }
  return map[type] || 'fas fa-question'
}

function getBadgeClass(type: string, index: number) {
  const byType: Record<string, string> = {
    'multiple-choice': 'bg-purple-200 text-purple-700',
    'true-false': 'bg-yellow-200 text-yellow-800',
    'fill-blank': 'bg-pink-200 text-pink-800',
    'short-answer': 'bg-indigo-200 text-indigo-800',
    'matching': 'bg-teal-200 text-teal-800',
    'enumeration': 'bg-blue-200 text-blue-800',
    'image-question': 'bg-rose-200 text-rose-800',
    'essay': 'bg-amber-200 text-amber-800',
  }
  if (byType[type]) return byType[type]
  const palette = [
    'bg-purple-200 text-purple-700',
    'bg-yellow-200 text-yellow-800',
    'bg-pink-200 text-pink-800',
    'bg-indigo-200 text-indigo-800',
  ]
  return palette[index % palette.length]
}
</script>

<template>
  <div class="bg-gray-50 font-sans h-full overflow-hidden">
    <div class="flex h-full overflow-hidden">
      <!-- Left Sidebar -->
      <div class="w-70  flex flex-col p-4 pb-0">
        <div class="flex-1 bg-white p-4 overflow-y-auto rounded-lg pretty-scroll">
          <div v-if="!hasQuestions" class="p-4 text-gray-500 text-center">
            No questions added yet
          </div>
          
          <div
            v-for="(question, index) in quiz.questions"
            :key="question.id"
            @click="selectQuestion(index)"
            :class="[
              'mb-2 px-3 py-2 rounded-md cursor-pointer flex items-center gap-3 transition-all relative',
              index === quiz.currentQuestionIndex
                ? 'bg-blue-100 ring-1 ring-blue-200'
                : 'bg-white hover:bg-gray-50 border border-gray-100'
            ]"
          >
            <div class="w-8 h-8 rounded-lg flex items-center justify-center text-blue-700 bg-blue-100">
              <i :class="getQuestionIcon(question.type)"></i>
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-800 truncate">
                {{ question.text || `${question.type.replace('-', ' ')}...` }}
              </div>
            </div>

            <span :class="['text-xs font-semibold px-2 py-1 rounded-md', getBadgeClass(question.type, index)]">
              {{ index + 1 }}
            </span>

            <div class="ml-1 relative" @click.stop>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                @click.stop="toggleQuestionMenu(index)"
                title="More actions"
              >
                <i class="fas fa-ellipsis-v"></i>
              </button>
              <div v-if="openMenuIndex === index" class="absolute right-0 top-9 z-10 w-36 bg-white border border-gray-200 rounded-md shadow-md py-1">
                <button
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  @click.stop="duplicateQuestion(index)"
                >
                  <i class="fas fa-copy text-gray-500"></i>
                  Duplicate
                </button>
                <button
                  class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click.stop="deleteQuestion(index)"
                >
                  <i class="fas fa-trash"></i>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white mt-6 p-4 pb-10 ">
          <button @click="openAddQuestionModal" 
                  class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors cursor-pointer">
            <i class="fas fa-plus mr-2"></i> Add Question
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Bar - Quiz Info -->
        <div class="py-4">
          <div class="bg-white p-4 flex items-start gap-4 rounded-lg">
            <!-- Add Question Button -->
            <div class="flex-shrink-0">
              <button @click="openAddQuestionModal"
                      class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center transition-colors cursor-pointer">
                <i class="fas fa-plus mr-2"></i>
                Add Question
              </button>
            </div>

            <div class="hidden md:block w-px bg-gray-200 h-10 self-center"></div>

            <!-- QuizInputs -->
            <div class="flex-1">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div>
                  <input v-model="quiz.title" type="text" 
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                         placeholder="Quiz Title">
                </div>
                <div>
                  <select v-model="quiz.subject" 
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Course</option>
                    <option value="math">Information Assurance</option>
                    <option value="science">Automata</option>
                    <option value="history">Computer Architecture</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle Content - Question Editor -->
        <div id="quiz-main-content" class="flex-1 overflow-auto py-6 bg-gray-50 scrollbar-hide">
          <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            <div v-if="!currentQuestion" class="text-center text-gray-500">
              <i class="fas fa-question-circle text-4xl mb-4 text-blue-200"></i>
              <h3 class="text-lg font-medium mb-2">No Question Selected</h3>
              <p>Select a question from the sidebar or add a new one to start editing</p>
            </div>
            
            <!-- Question Editor -->
            <div v-else class="fade-in">
              <!-- Question Text -->
              <div class="mb-6">
                <div class="flex items-center gap-3 mb-2">
                  <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                    {{ quiz.currentQuestionIndex + 1 }}
                  </span>
                  <span class="text-sm font-medium text-gray-700">Question Text</span>
                </div>
                <textarea v-model="currentQuestion.text"
                          @input="autoResizeTextarea($event)"
                          class="w-full px-4 py-3 rounded-lg bg-gray-50 focus:bg-white border-0 ring-1 ring-transparent focus:ring-2 focus:ring-blue-100 focus:outline-none placeholder-gray-400 shadow-inner resize-none overflow-hidden"
                          rows="1"
                          placeholder="Type your question here..."></textarea>
              </div>

              <!-- Multiple Choice Options -->
              <div v-if="currentQuestion.type === 'multiple-choice'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Options</label>
                <div class="space-y-3">
                  <div v-for="(option, index) in currentQuestion.options" :key="index" class="flex items-center">
                    <!-- Option Card -->
                    <div class="flex-1 group">
                      <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                        <input v-model="option.isCorrect" type="radio" :name="`correct-${currentQuestion.id}`"
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />

                        <!-- Option index chip -->
                        <span class="min-w-6 h-6 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                          {{ getOptionLetter(index) }}
                        </span>

                        <!-- Thumbnail image -->
                        <div v-if="option.imageUrl" class="w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                          <img :src="option.imageUrl" alt="option image" class="w-full h-full object-cover" />
                        </div>

                        <!-- Option Text -->
                        <input v-model="option.text" type="text" :placeholder="`Option ${index + 1}`"
                               class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400" />
                      </div>
                    </div>

                    <div class="ml-3 flex items-center gap-2 self-stretch">
                      <!-- Image upload -->
                      <input :id="`opt-img-${currentQuestion.id}-${index}`" type="file" accept="image/*" class="hidden"
                             @change="onOptionImageChange(index, $event)" />
                      <label :for="`opt-img-${currentQuestion.id}-${index}`" title="Add image"
                             class="inline-flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 cursor-pointer transition">
                        <i class="fas fa-image"></i>
                      </label>

                      <!-- Delete -->
                      <button @click="removeOption(index)" title="Remove option"
                              class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button @click="addOption"
                        class="mt-3 bg-blue-50 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">
                  <i class="fas fa-plus mr-1"></i> Add Option
                </button>
              </div>

              <!-- True/False Options -->
              <div v-else-if="currentQuestion.type === 'true-false'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                <div class="space-y-3">
                  <div v-for="(option, index) in currentQuestion.options" :key="index" class="flex items-center">
                    <div class="flex-1 group">
                      <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                        <input v-model="option.isCorrect" type="radio" :name="`correct-${currentQuestion.id}`"
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
                        <span class="min-w-6 h-6 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                          {{ getOptionLetter(index) }}
                        </span>
                        <input v-model="option.text" type="text"
                               class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fill in the Blank -->
              <div v-else-if="currentQuestion.type === 'fill-blank'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                <div class="flex items-center">
                  <div class="flex-1 group">
                    <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                      <i class="fas fa-pencil-alt text-blue-500"></i>
                      <input v-model="currentQuestion.correctAnswer" type="text"
                             class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
                             placeholder="Enter the correct answer for the blank" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Short Answer -->
              <div v-else-if="currentQuestion.type === 'short-answer'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                <div class="flex items-center">
                  <div class="flex-1 group">
                    <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                      <i class="fas fa-align-left text-blue-500"></i>
                      <input v-model="currentQuestion.correctAnswer" type="text"
                             class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
                             placeholder="Enter the correct answer" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Matching Pairs -->
              <div v-else-if="currentQuestion.type === 'matching'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Matching Pairs</label>
                <div class="space-y-3">
                  <div v-for="(pair, index) in currentQuestion.pairs" :key="index" class="flex items-center">
                    <div class="flex-1 group">
                      <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                        <input v-model="pair.left" type="text"
                               class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
                               placeholder="Term" />
                        <i class="fas fa-arrows-alt-h text-gray-300"></i>
                        <input v-model="pair.right" type="text"
                               class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400"
                               placeholder="Definition" />
                      </div>
                    </div>

                    <div class="ml-3 flex items-center gap-2 self-stretch">
                      <button @click="removePair(index)" title="Remove pair"
                              class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button @click="addPair" 
                        class="mt-3 bg-blue-50 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">
                  <i class="fas fa-plus mr-1"></i> Add Pair
                </button>
              </div>

              <!-- Enumeration Items -->
              <div v-else-if="currentQuestion.type === 'enumeration'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Items to Enumerate</label>
                <div class="space-y-3">
                  <div v-for="(item, index) in currentQuestion.items" :key="index" class="flex items-center">
                    <div class="flex-1 group">
                      <div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-2.5 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                        <span class="min-w-6 h-6 inline-flex items-center justify-center text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
                          {{ getOptionLetter(index) }}
                        </span>

                        <input v-model="currentQuestion.items[index]" type="text"
                               :placeholder="`Item ${index + 1}`"
                               class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400" />
                      </div>
                    </div>

                    <div class="ml-3 flex items-center gap-2 self-stretch">
                      <button @click="removeItem(index)" title="Remove item"
                              class="inline-flex items-center justify-center w-9 h-9 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <button @click="addItem"
                        class="mt-3 bg-blue-50 text-blue-600 text-sm py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">
                  <i class="fas fa-plus mr-1"></i> Add Item
                </button>
              </div>

              <!-- Essay-->
              <div v-else-if="currentQuestion.type === 'essay'" class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Sample Answer (optional)</label>
                <div class="flex items-start">
                  <div class="flex-1 group">
                    <div class="flex items-start gap-3 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:from-white hover:to-white px-4 py-3 shadow-sm hover:shadow-sm transition focus-within:ring-2 focus-within:ring-blue-100">
                      <i class="fas fa-pen-fancy text-blue-500 mt-1"></i>
                      <textarea v-model="currentQuestion.correctAnswer"
                                class="flex-1 px-3 py-2 rounded-md bg-transparent focus:outline-none focus:ring-0 placeholder-gray-400 resize-none"
                                rows="5"
                                placeholder="Enter a sample answer"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="w-80 flex flex-col p-4">
        <div class="bg-white rounded-lg flex-1 overflow-y-auto p-4 pretty-scroll space-y-6">
          <!-- Section: Type and Points -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Question Type</label>
            </div>
            <select v-model="questionSettings.type" 
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option v-for="type in questionTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
            <div class="grid grid-cols-1 gap-3 mt-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Points</label>
                <input v-model.number="questionSettings.points" type="number" min="1" 
                       class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>
          </div>

          <!-- Section: Media -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">Media</label>
            </div>
            <select v-model="questionSettings.mediaType" 
                    class="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
              <option value="none">None</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <div v-if="showMediaUpload" class="">
              <div v-if="currentQuestion?.mediaUrl" class="mb-3">
                <div v-if="questionSettings.mediaType === 'image'" class="relative">
                  <img :src="currentQuestion.mediaUrl" alt="question media" class="w-full h-40 object-cover rounded-md border" />
                </div>
                <div v-else-if="questionSettings.mediaType === 'video'" class="relative">
                  <video :src="currentQuestion.mediaUrl" controls class="w-full h-40 object-cover rounded-md border"></video>
                </div>
                <button @click="clearQuestionMedia" class="mt-2 text-red-600 text-sm hover:underline">Remove media</button>
              </div>
              <label class="block w-full">
                <div class="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-blue-300 transition">
                  <i class="fas fa-cloud-upload-alt text-3xl text-blue-300 mb-2"></i>
                  <p class="text-sm text-gray-500">Click to upload or drag and drop</p>
                </div>
                <input type="file" accept="image/*,video/*" class="hidden" @change="onQuestionMediaChange" />
              </label>
            </div>
          </div>

          <!-- Section: Actions -->
          <div v-if="currentQuestion" class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-gray-700">Question Actions</span> 
            </div>
            <div class="grid grid-cols-2 gap-3">
              <button @click="duplicateCurrentQuestion" 
                      class="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <i class="fas fa-copy"></i>
                <span class="text-sm">Duplicate</span>
              </button>
              <button @click="deleteCurrentQuestion" 
                      class="bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <i class="fas fa-trash"></i>
                <span class="text-sm">Delete</span>
              </button>
              <button @click="moveQuestion('up')" 
                      class="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <i class="fas fa-arrow-up"></i>
                <span class="text-sm">Move <br> Up</span>
              </button>
              <button @click="moveQuestion('down')" 
                      class="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <i class="fas fa-arrow-down"></i>
                <span class="text-sm">Move Down</span>
              </button>
              <button v-if="currentQuestion.type === 'multiple-choice'" @click="shuffleOptions" 
                      class="col-span-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-md flex items-center justify-center gap-2 transition-colors">
                <i class="fas fa-random"></i>
                <span class="text-sm">Shuffle Options</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Question Modal -->
    <div v-if="showAddQuestionModal" 
         class="fixed inset-0 bg-black/40 backdrop-blur-sm backdrop-saturate-150 flex items-center justify-center z-50">
      <div class="bg-white/90 backdrop-blur-md rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div class="bg-white p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-blue-700">Add New Question</h3>
            <button @click="closeAddQuestionModal" class="text-gray-500 hover:text-gray-700">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="type in questionTypes" :key="type.value" 
                 @click="addQuestion(type.value)"
                 class="bg-blue-50 border border-blue-100 rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center hover:bg-blue-100 hover:transform hover:scale-105 transition-all duration-200">
              <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <i :class="type.icon" class="text-blue-600 text-xl"></i>
              </div>
              <h4 class="font-medium text-blue-800 mb-1">{{ type.label }}</h4>
              <p class="text-xs text-gray-500 text-center">
                {{ getQuestionTypeDescription(type.value) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

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

.border-l-3 {
  border-left-width: 3px;
}

.scrollbar-hide {
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}
.scrollbar-hide::-webkit-scrollbar {
  display: none; 
}

.pretty-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.6) transparent; 
}
.pretty-scroll::-webkit-scrollbar {
  width: 10px;
}
.pretty-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.pretty-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5); 
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: content-box;
}
.pretty-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.7);
}
.pretty-scroll::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
</style>
