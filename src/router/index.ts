import { createRouter, createWebHistory } from 'vue-router'

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
      path: '/quiz',
      name: 'quiz',
      component: () => import('../views/QuizView.vue'),
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('../views/StudentView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
    },
    {
      path: '/teacher/classes/:id',
      name: 'teacher-class',
      component: () => import('../views/TeacherClassView.vue'),
      props: true,
    },
    {
      path: '/teacher/classes/:id/dashboard',
      name: 'teacher-class-dashboard',
      component: () => import('../views/ClassroomDashboardView.vue'),
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
      path: '/teacher/create-quiz',
      redirect: '/teacher/classes/1/quiz/create',
    },
    {
      path: '/teacher/classes/:id/quiz/results',
      redirect: (to) => ({ name: 'quiz-results', params: to.params }),
    },
  ],
})

export default router
