// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import ProductsList from '../views/ProductsList.vue'
import OrdersList from '../views/OrdersList.vue'
import OrdersAndBookings from '../views/DashboardHome.vue'
import LoginPage from '../views/LoginPage.vue'
import payouts from '../views/Payouts.vue'

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
          meta: { requiresAuth: true }
        },
        {
          path: 'orders',
          name: 'orders',
          component: OrdersList,
          meta: { requiresAuth: true }
        },
        {
          path: 'payouts',
          name: 'payouts',
          component: payouts,
          meta: { requiresAuth: true }
        },

        {
          path: 'orders-and-bookings',
          name: 'orders-and-bookings',
          component: OrdersAndBookings,
          meta: { requiresAuth: true }
        }
      ]
    },
    // Catch all redirect to dashboard if authenticated, or login if not
    {
      path: '/:pathMatch(.*)*',
      redirect: () => {
        // This will be handled by the navigation guard
        return '/dashboard'
      }
    }
  ]
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath } // Save the intended destination
    })
    return
  }

  // If route is for guests only (login page) and user is authenticated
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/dashboard')
    return
  }

  // If user is authenticated and trying to access root, redirect to dashboard
  if (to.path === '/' && isAuthenticated) {
    next('/dashboard')
    return
  }

  // If user is not authenticated and trying to access root, redirect to login
  if (to.path === '/' && !isAuthenticated) {
    next('/login')
    return
  }

  // Allow navigation
  next()
})

// Optional: Handle authentication state changes globally
let authSubscription: any = null

// Initialize auth listener when router is created
if (typeof window !== 'undefined') {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // If user signs out, redirect to login
      if (event === 'SIGNED_OUT') {
        await router.push('/login')
      }
      
      // If user signs in, redirect to dashboard
      if (event === 'SIGNED_IN') {
        // Check if there's a redirect query parameter
        const redirect = router.currentRoute.value.query.redirect as string
        if (redirect) {
          await router.push(redirect)
        } else {
          await router.push('/dashboard')
        }
      }
    }
  )
  authSubscription = subscription
}

// Clean up subscription when router is destroyed
router.beforeEach((to, from, next) => {
  // Store the subscription for cleanup if needed
  next()
})

export default router