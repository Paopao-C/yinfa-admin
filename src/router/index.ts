import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      // children: [
      //   {
      //     path: 'dashboard',
      //     name: 'Dashboard',
      //     component: () => import('../views/Dashboard.vue')
      //   },
      //   {
      //     path: 'articles',
      //     name: 'Articles',
      //     component: () => import('../views/Articles.vue')
      //   },
      //   // 后续添加更多子路由
      //   { path: '', redirect: '/admin/dashboard' }
      // ]
    },
    { path: '/', redirect: '/admin' }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('adminToken')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/admin')
  } else {
    next()
  }
})

export default router
