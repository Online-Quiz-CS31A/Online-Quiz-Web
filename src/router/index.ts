import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/teacher',
      name: 'teacher',
      component: () => import('../views/TeacherView.vue'),
    },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/manager',
      name: 'manager',
      component: () => import('../views/ManagerView.vue'),
    },
    {
      path: '/teacher/profile',
      name: 'teacher-profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/student/profile',
      name: 'student-profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/quiz/:quizId?',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
      props: true,
    },
    {
      path: '/quiz/review',
      name: 'quiz-review',
      component: () => import('../views/ReviewQuizView.vue'),
    },
    {
      path: '/quiz/score',
      name: 'quiz-score',
      component: () => import('../views/QuizScoreView.vue'),
    },
    {
      path: '/quiz/preview',
      name: 'quiz-preview',
      component: () => import('../views/QuizPreviewView.vue'),
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('../views/StudentView.vue'),
    },
    {
      path: '/student/quizzes/:quizId/info',
      name: 'student-prequiz',
      component: () => import('../views/PreQuizInfoView.vue'),
      props: true,
    },
    {
      path: '/student/courses/:id/dashboard',
      name: 'student-course-dashboard',
      component: () => import('../views/StudentCourseDashboardView.vue'),
      props: true,
    },
    {
      path: '/admin',
      component: () => import('../views/AdminView.vue'),
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('../components/admin/AdminDashboard.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('../components/admin/AdminUserManagement.vue'),
        },
        {
          path: 'courses',
          name: 'admin-courses',
          component: () => import('../components/admin/AdminCourseCatalog.vue'),
        },
        {
          path: 'quiz-settings',
          name: 'admin-quiz-settings',
          component: () => import('../components/admin/AdminQuizSettings.vue'),
        },
        {
          path: 'data',
          name: 'admin-data',
          component: () => import('../components/admin/AdminDataManagement.vue'),
        },
        {
          path: 'analytics',
          name: 'admin-analytics',
          component: () => import('../components/admin/AdminAnalytics.vue'),
        },
        {
          path: 'archived',
          redirect: '/admin/archived/courses',
        },
        {
          path: 'archived/courses',
          name: 'admin-archived-courses',
          component: () => import('../components/admin/AdminArchivedCourses.vue'),
        },
        {
          path: 'archived/users',
          name: 'admin-archived-users',
          component: () => import('../components/admin/AdminArchivedUsers.vue'),
        },
      ],
    },
    {
      path: '/teacher/classes/:code',
      name: 'teacher-class',
      component: () => import('../views/TeacherClassView.vue'),
      props: true,
    },
    {
      path: '/teacher/classes/:id/dashboard',
      name: 'teacher-class-dashboard',
      component: () => import('../views/TeacherClassroomDashboardView.vue'),
      props: true,
    },
    {
      path: '/teacher/classes/:id/quiz',
      component: () => import('../views/QuizBuilderView.vue'),
      props: true,
      children: [
        {
          path: 'create',
          name: 'quiz-builder',
          component: () => import('../components/quiz/QuizContent.vue'),
          props: true,
        },
        {
          path: 'assign',
          name: 'quiz-assign',
          component: () => import('../components/quiz/QuizAssign.vue'),
          props: true,
        },
        {
          path: 'results',
          name: 'quiz-results',
          component: () => import('../components/quiz/QuizResults.vue'),
          props: true,
        },
      ]
    },
    {
      path: '/teacher/classes/:code/manage',
      name: 'class-management',
      component: () => import('../views/ClassManagementView.vue'),
      props: true,
    },
    {
      path: '/teacher/create-quiz',
      name: 'create-quiz-root',
      redirect: () => {
        return { name: 'quiz-builder', params: { id: '1' } }
      }
    },
    {
      path: '/teacher/classes/:id/quiz/results',
      redirect: (to) => ({ name: 'quiz-results', params: to.params }),
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  const requiresAuth = to.path !== '/'
  const isLoginPage = to.path === '/' || to.name === 'login'

  if (isAuthenticated && isLoginPage) {
    if (userRole === 'admin') {
      return next({ name: 'admin-dashboard' })
    } else if (userRole === 'teacher') {
      return next({ name: 'teacher' })
    } else if (userRole === 'student') {
      return next({ name: 'student' })
    }
  }

  if (requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  if (isAuthenticated) {
    const path = to.path.toLowerCase()

    if (userRole === 'admin') {
      if (!path.startsWith('/admin')) {
        return next({ name: 'admin-dashboard' })
      }
    }

    else if (userRole === 'teacher') {
      if (path.startsWith('/admin') || path.startsWith('/student')) {
        return next({ name: 'teacher' })
      }
    }

    else if (userRole === 'student') {
      if (path.startsWith('/admin') || path.startsWith('/teacher')) {
        return next({ name: 'student' })
      }
    }
  }

  next()
})

export default router

