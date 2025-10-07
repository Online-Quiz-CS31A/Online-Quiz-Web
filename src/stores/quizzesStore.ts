import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { TeacherQuizItem, StudentQuizItem } from '../interfaces/interfaces'
import { useAuthStore } from './authStore'

export const useQuizzesStore = defineStore('quizzes', () => {
  const teacherQuizzesByUser = ref<Record<string, TeacherQuizItem[]>>({
    '0112345678': [
      { id: 1, subject: 'Information Assurance', title: 'Week 1 Quiz', description: '', dueDate: 'May 15', class: 'CS31A', submitted: 12, total: 24, color: 'blue' },
      { id: 2, subject: 'Information Assurance', title: 'Week 2 Quiz', description: '', dueDate: 'May 18', class: 'CS31A', submitted: 8, total: 24, color: 'green' },
      { id: 3, subject: 'Computer Architecture', title: 'Week 5 Quiz', description: '', dueDate: 'May 20', class: 'CS31A', submitted: 3, total: 24, color: 'purple' },
      { id: 4, subject: 'Operating Systems', title: 'Process Management Quiz', description: '', dueDate: 'May 25', class: 'CS31B', submitted: 17, total: 28, color: 'red' },
      { id: 5, subject: 'Automata', title: 'PDA and CFG Quiz', description: '', dueDate: 'May 28', class: 'CS31C', submitted: 9, total: 22, color: 'yellow' },
    ],
  })

  const studentQuizzesByUser = ref<Record<string, StudentQuizItem[]>>({
    '0212345678': [
      { id: 1, subject: 'Information Assurance', title: 'Week 1 Quiz', description: '', dueDate: 'May 15', class: 'CS31A', timeLimit: '45 min', status: 'Not Started', color: 'blue' },
      { id: 2, subject: 'Information Assurance', title: 'Week 2 Quiz', description: '', dueDate: 'May 18', class: 'CS31A', timeLimit: '30 min', status: 'Not Started', color: 'green' },
      { id: 3, subject: 'Computer Architecture', title: 'Week 5 Quiz', description: '', dueDate: 'May 20', class: 'CS31A', timeLimit: '25 min', status: 'Not Started', color: 'purple' },
      { id: 4, subject: 'Web Development', title: 'Flexbox & Grid Quiz', description: '', dueDate: 'May 22', class: 'WD101', timeLimit: '20 min', status: 'Not Started', color: 'indigo' },
    ],
  })

  const auth = useAuthStore()

  const myTeacherQuizzes = computed<TeacherQuizItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    return teacherQuizzesByUser.value[uname] || []
  })

  const myStudentQuizzes = computed<StudentQuizItem[]>(() => {
    const uname = auth.currentUser?.username
    if (!uname) return []
    return studentQuizzesByUser.value[uname] || []
  })

  return {
    myTeacherQuizzes,
    myStudentQuizzes,
  }
})
