<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Upload, FileText, CheckCircle, AlertCircle, X, Download } from 'lucide-vue-next'

// TYPES
interface Props {
  open: boolean
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

// PROPS
const props = defineProps<Props>()

// EMITS
const emit = defineEmits<{
  close: []
  import: [file: File]
}>()

// REFS
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploadStatus = ref<UploadStatus>('idle')
const errorMessage = ref('')
const isDragging = ref(false)
const uploadProgress = ref(0)

// COMPUTED
const hasFile = computed(() => selectedFile.value !== null)
const fileSize = computed(() => {
  if (!selectedFile.value) return ''
  const bytes = selectedFile.value.size
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
})

const acceptedFormats = ['.xlsx', '.csv']

// WATCHERS
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    resetModal()
  }
})

// METHODS
function resetModal() {
  selectedFile.value = null
  uploadStatus.value = 'idle'
  errorMessage.value = ''
  uploadProgress.value = 0
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function validateAndSetFile(file: File) {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  
  if (!acceptedFormats.includes(extension)) {
    uploadStatus.value = 'error'
    errorMessage.value = `Invalid file format. Please upload ${acceptedFormats.join(', ')} files only.`
    return
  }
  
  if (file.size > 10 * 1024 * 1024) { 
    uploadStatus.value = 'error'
    errorMessage.value = 'File size exceeds 10MB limit.'
    return
  }
  
  selectedFile.value = file
  uploadStatus.value = 'idle'
  errorMessage.value = ''
}

function triggerFileInput() {
  fileInput.value?.click()
}

function removeFile() {
  resetModal()
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

async function handleImport() {
  if (!selectedFile.value) return
  
  uploadStatus.value = 'uploading'
  uploadProgress.value = 0
  
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      uploadStatus.value = 'success'
      
      setTimeout(() => {
        emit('import', selectedFile.value!)
      }, 800)
    }
  }, 150)
}

function downloadTemplate() {
  const csvContent = [
    'Question Type,Question Text,Points,Option A,Option B,Option C,Option D,Correct Answer,Required',
    'multiple-choice,What is the capital of France?,1,London,Berlin,Paris,Madrid,C,Yes',
    'true-false,The Earth is flat.,1,True,False,,,B,Yes',
    'short-answer,What is 2+2?,2,,,,,,Yes',
    'essay,Explain photosynthesis.,5,,,,,,No',
    'fill-blank,The capital of Japan is _____.,1,,,,,,Yes'
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'questions-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function closeModal() {
  emit('close')
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div 
      class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      @click="closeModal"
    ></div>
    
    <!-- Modal -->
    <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto overflow-hidden animate-slideUp">
      <!-- Header -->
      <div class="relative px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
              <Upload class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900">Import Questions</h3>
              <p class="text-sm text-gray-600 mt-0.5">Upload your question bank file</p>
            </div>
          </div>
          <button 
            @click="closeModal"
            class="w-8 h-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      <!-- Body -->
      <div class="p-6 space-y-4">
        <!-- Upload Area -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
          class="relative border-2 border-dashed rounded-xl p-6 transition-all duration-200"
          :class="{
            'border-blue-400 bg-blue-50': isDragging,
            'border-gray-300 hover:border-blue-400 hover:bg-gray-50': !isDragging && !hasFile,
            'border-green-400 bg-green-50': hasFile && uploadStatus !== 'error',
            'border-red-400 bg-red-50': uploadStatus === 'error'
          }"
        >
          <input
            ref="fileInput"
            type="file"
            :accept="acceptedFormats.join(',')"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <!-- Upload State -->
          <div v-if="!hasFile" class="text-center">
            <div class="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3">
              <Upload class="w-7 h-7 text-blue-600" />
            </div>
            <h4 class="text-base font-semibold text-gray-900 mb-1">
              {{ isDragging ? 'Drop your file here' : 'Upload Spreadsheet' }}
            </h4>
            <p class="text-sm text-gray-600 mb-3">
              Drag and drop or click to browse
            </p>
            <button
              @click="triggerFileInput"
              class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer shadow-sm text-sm"
            >
              Choose File
            </button>
            <p class="text-xs text-gray-500 mt-3">
              Excel or CSV files only (Max 10MB)
            </p>
          </div>
          
          <!-- File Selected -->
          <div v-else class="flex items-start gap-4">
            <div class="flex-shrink-0">
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                :class="{
                  'bg-gradient-to-br from-blue-500 to-indigo-600': uploadStatus !== 'error',
                  'bg-gradient-to-br from-red-500 to-red-600': uploadStatus === 'error'
                }"
              >
                <FileText class="w-6 h-6 text-white" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm font-semibold text-gray-900 truncate">
                    {{ selectedFile?.name }}
                  </h4>
                  <p class="text-xs text-gray-500 mt-1">{{ fileSize }}</p>
                </div>
                <button
                  v-if="uploadStatus !== 'uploading'"
                  @click="removeFile"
                  class="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-white/80 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X class="w-4 h-4 text-gray-500" />
                </button>
              </div>
              
              <!-- Progress Bar -->
              <div v-if="uploadStatus === 'uploading'" class="mt-3">
                <div class="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{{ uploadProgress }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300 rounded-full"
                    :style="{ width: `${uploadProgress}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Success Message -->
              <div v-if="uploadStatus === 'success'" class="mt-3 flex items-center gap-2 text-sm text-green-600">
                <CheckCircle class="w-4 h-4" />
                <span class="font-medium">Upload successful!</span>
              </div>
            </div>
          </div>
          
          <!-- Error Message -->
          <div v-if="uploadStatus === 'error'" class="mt-4 flex items-start gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
            <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>
        </div>
        
        <!-- Template Download -->
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Download class="w-4 h-4 text-gray-600" />
            </div>
            <div class="flex-1">
              <h4 class="text-sm font-semibold text-gray-900">Need a template?</h4>
              <p class="text-xs text-gray-600">Download our CSV template</p>
            </div>
            <button
              @click="downloadTemplate"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
            >
              <Download class="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
        
        <!-- Info -->
        <div class="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <AlertCircle class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div class="text-xs text-blue-800">
            <span class="font-medium">Tip:</span> Ensure your spreadsheet follows the template format. Questions will be imported and ready for use.
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
          @click="closeModal"
          class="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-white font-medium transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          @click="handleImport"
          :disabled="!hasFile || uploadStatus === 'uploading' || uploadStatus === 'error'"
          class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Upload class="w-4 h-4" />
          {{ uploadStatus === 'uploading' ? 'Importing...' : 'Import Questions' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s ease-out;
}
</style>
