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
          path: 'delivery',
          name: 'delivery',
          component: delivery,
          meta: { requiresAuth: true }
        }
      ]
    },
    // Catch all redirect to dashboard if authenticated, or login if not
    {
      path: '/:pathMatch(.*)*',
      redirect: () => {
        return '/dashboard'
      }
    }
  ]
})

// ✅ Track if this is the initial load
let isInitialLoad = true
let redirectInProgress = false

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Prevent multiple simultaneous redirects
  if (redirectInProgress) {
    next(false)
    return
  }

  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  // ✅ If route requires auth and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    redirectInProgress = true
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    redirectInProgress = false
    return
  }

  // ✅ If route is for guests only (login page) and user is authenticated
  if (to.meta.requiresGuest && isAuthenticated) {
    // If trying to go to login while authenticated, go to dashboard
    // But preserve the intended redirect if coming from a protected route
    const redirectPath = to.query.redirect as string
    if (redirectPath && redirectPath !== '/login') {
      redirectInProgress = true
      next(redirectPath)
      redirectInProgress = false
      return
    }
    redirectInProgress = true
    next('/dashboard')
    redirectInProgress = false
    return
  }

  // ✅ If user is authenticated and trying to access root
  if (to.path === '/' && isAuthenticated) {
    redirectInProgress = true
    next('/dashboard')
    redirectInProgress = false
    return
  }

  // ✅ If user is not authenticated and trying to access root
  if (to.path === '/' && !isAuthenticated) {
    redirectInProgress = true
    next('/login')
    redirectInProgress = false
    return
  }

  // ✅ Allow navigation
  isInitialLoad = false
  next()
})

// ✅ Handle authentication state changes with better logic
let authSubscription: any = null

// Initialize auth listener when router is created
if (typeof window !== 'undefined') {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      // ✅ If user signs out, redirect to login
      if (event === 'SIGNED_OUT') {
        // Only redirect if not already on login page
        if (router.currentRoute.value.path !== '/login') {
          await router.push('/login')
        }
        return
      }
      
      // ✅ If user signs in, handle redirect with care
      if (event === 'SIGNED_IN') {
        // Check if there's a redirect query parameter
        const redirect = router.currentRoute.value.query.redirect as string
        
        // Don't redirect on initial load - the navigation guard will handle it
        if (isInitialLoad) {
          // On initial load, let the navigation guard handle routing
          // But if we're on login page, redirect to the intended destination or dashboard
          if (router.currentRoute.value.path === '/login') {
            if (redirect && redirect !== '/login') {
              await router.push(redirect)
            } else {
              await router.push('/dashboard')
            }
          }
          return
        }

        // For subsequent sign-ins (not initial load)
        if (redirect && redirect !== '/login') {
          await router.push(redirect)
        } else {
          await router.push('/dashboard')
        }
      }
    }
  )
  authSubscription = subscription
}

// ✅ Clean up subscription when router is destroyed
export function cleanupRouter() {
  if (authSubscription) {
    authSubscription.unsubscribe()
  }
}

// ✅ Expose router for cleanup if needed
export default router