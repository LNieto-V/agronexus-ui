import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import { useAuthStore } from '@/stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home'
  },
  {
    path: '/login',
    component: () => import('@/views/LoginPage.vue')
  },
  {
    path: '/register',
    component: () => import('@/views/RegisterPage.vue')
  },
  {
    path: '/tabs',
    component: TabsPage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/tabs/home'
      },
      {
        path: 'home',
        component: () => import('@/views/WelcomeHome.vue')
      },
      {
        path: 'dashboard',
        component: () => import('@/views/TelemetryDashboard.vue')
      },
      {
        path: 'assistant',
        component: () => import('@/views/TabChat.vue')
      },
      {
        path: 'control',
        component: () => import('@/views/TabSystem.vue')
      },
      {
        path: 'reports',
        component: () => import('@/views/ReportsPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  
  // Ensure auth is initialized
  if (!authStore.initialized) {
    await authStore.initialize();
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }

  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    return '/tabs/home';
  }

  return true;
});

// Fallback route for unknown paths
routes.push({
  path: '/:pathMatch(.*)*',
  redirect: '/tabs/home'
});


export default router
