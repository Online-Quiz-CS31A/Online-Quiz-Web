<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const QuizContent = defineAsyncComponent(() => import('@/components/quiz/QuizContent.vue'))

const route = useRoute()
const router = useRouter()

const showResults = ref(route.name === 'quiz-results')
const showAssign = ref(route.name === 'quiz-assign')
const published = ref(false)

watch(() => route.name, (newRouteName) => {
  showResults.value = newRouteName === 'quiz-results'
  showAssign.value = newRouteName === 'quiz-assign'
})

const creatorRef = ref<InstanceType<typeof QuizContent> | null>(null)

const quiz = ref({
  title: '',
  subject: '',
  timeLimit: '',
  questions: []
})

function onContent() {
  showResults.value = false
  showAssign.value = false
  router.push({ name: 'quiz-builder' })
  const el = document.querySelector('#quiz-main-content') as HTMLElement | null
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function onSave() {
  creatorRef.value?.saveQuiz?.()
}

function onPublish() {
  creatorRef.value?.publishQuiz?.()
  published.value = true
  router.push({ name: 'quiz-builder' })
}

function onAssign() {
  showAssign.value = true
  showResults.value = false
  router.push({ name: 'quiz-assign' })
}

function onResults() {
  showResults.value = true
  showAssign.value = false
  router.push({ name: 'quiz-results' })
}

function onPreview() {
  console.log('Preview quiz...')
}
</script>

<template>
  <div class="bg-gray-50 font-sans h-screen overflow-hidden flex flex-col">
    <div class="shrink-0">
      <Header
      breadcrumb="Dashboard > Create Quiz"
      :show-notification="false"
      :action-buttons="true"
      :show-quiz-creator-controls="true"
      :published="published"
      @content="onContent"
      @save="onSave"
      @publish="onPublish"
      @assign="onAssign"
      @results="onResults"
      @preview="onPreview"
      >
        <template #publish-summary>
          <div class="bg-gray-50 rounded p-3 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Title:</span>
              <span class="font-medium">{{ quiz.title || 'Untitled Quiz' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Subject:</span>
              <span class="font-medium">{{ quiz.subject || 'Not specified' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Questions:</span>
              <span class="font-medium">{{ quiz.questions?.length || 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Time Limit:</span>
              <span class="font-medium">{{ quiz.timeLimit || 'Not set' }}</span>
            </div>
          </div>
        </template>
      </Header>
    </div>

    <div class="flex-1 flex flex-col overflow-hidden">
      <router-view v-slot="{ Component }">
        <div class="h-full overflow-y-auto">
          <component :is="Component" ref="creatorRef" class="min-h-full" />
        </div>
      </router-view>
    </div>
  </div>
</template>
