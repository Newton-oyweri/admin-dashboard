// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import ProductsList from '../views/ProductsList.vue'
import OrdersList from '../views/OrdersList.vue'
import LoginPage from '../views/LoginPage.vue'
import payouts from '../views/Payouts.vue'
import delivery from '../views/Delivery.vue'
import manager from '../views/Manager.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardHome,
          meta: { requiresAuth: true }
        },
        {
          path: 'products',
          name: 'products',
          component: ProductsList,
          meta: { requiresAuth: true, allowedRoles: ['seller', 'admin'] }
        },
        {
          path: 'orders',
          name: 'orders',
          component: OrdersList,
          meta: { requiresAuth: true, allowedRoles: ['seller', 'admin'] }
        },
        {
          path: 'payouts',
          name: 'payouts',
          component: payouts,
          meta: { requiresAuth: true, allowedRoles: ['seller', 'admin'] }
        },
        {
          path: 'delivery',
          name: 'delivery',
          component: delivery,
          meta: { requiresAuth: true, allowedRoles: ['delivery_person', 'admin'] }
        },
        {
          path: 'manager',
          name: 'manager',
          component: manager,
          meta: { requiresAuth: true, allowedRoles: ['admin'] }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard'
    }
  ]
})

// Navigation Guard - Auth + Role based
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // 1. Guest-only routes (Login page)
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  // 2. Protected routes
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // Role-based check
    if (to.meta.allowedRoles) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      const userRole = profile?.role

      if (!userRole || !(to.meta.allowedRoles as string[]).includes(userRole)) {
        // Redirect unauthorized users to safe page
        next('/dashboard')
        return
      }
    }
  }

  next()
})

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    router.push('/login')
  }
})

export default router