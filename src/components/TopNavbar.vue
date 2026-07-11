<!-- src/components/Navbar.vue -->
<template>
  <header class="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/90 shadow-sm">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
      
      <!-- Left Side: Welcome Text + Scrollable Navigation Links -->
      <div class="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
        <span class="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 whitespace-nowrap shrink-0">
          Hi, {{ firstName }}
        </span>
        
        <div class="h-4 w-px bg-zinc-200 dark:bg-zinc-700 shrink-0" />
        
        <nav class="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
          <button
            v-for="item in visibleNavItems"
            :key="item.id"
            @click="navigateTo(item.path)"
            class="rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer shrink-0"
            :class="isActive(item.path) 
              ? 'bg-orange-500 text-white shadow-sm' 
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'"
          >
            {{ item.label }}
          </button>
        </nav>
      </div>

      <!-- Right Side: Quick Action Controls -->
      <div class="flex items-center gap-2 shrink-0">
        <button
          v-if="showInstallButton"
          @click="handleInstall"
          class="rounded-md bg-orange-500 hover:bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition active:scale-[0.985] whitespace-nowrap"
          title="WonderBakes Seller is better on app"
        >
          Get App
        </button>

        <button
          @click="handleLogout"
          :disabled="loggingOut"
          class="rounded-md bg-red-500 hover:bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer whitespace-nowrap"
        >
          {{ loggingOut ? '...' : 'Logout' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const route = useRoute()

// State
const loggingOut = ref(false)
const userName = ref('User')
const userRole = ref<string | null>(null)
const deferredPrompt = ref<any>(null)
const isInstalled = ref(false)

// Computed
const firstName = computed(() => {
  return userName.value.split(' ')[0] || 'User'
})

// Navigation items
const allNavigationItems = [
  { id: 'orders', label: 'My orders', path: '/dashboard' },
  { id: 'products', label: 'My Products', path: '/products' },
  { id: 'payouts', label: 'Payout', path: '/payouts' },
  { id: 'delivery', label: 'Delivery', path: '/delivery' },
  { id: 'manager', label: 'Manager', path: '/manager' }
]

const visibleNavItems = computed(() => {
  if (!userRole.value) return []

  return allNavigationItems.filter((item) => {
    switch (userRole.value) {
      case 'admin':
        return true // Admin sees everything
      case 'delivery_person':
        return item.id === 'delivery'
      case 'seller':
        return ['orders', 'products', 'payouts'].includes(item.id)
      default:
        return false
    }
  })
})

const showInstallButton = computed(() => {
  return !isInstalled.value && deferredPrompt.value
})

// Methods
const isActive = (path: string) => route.path === path

const navigateTo = (path: string) => {
  router.push(path)
}

const handleInstall = async () => {
  if (!deferredPrompt.value) return
  deferredPrompt.value.prompt()
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') isInstalled.value = true
  deferredPrompt.value = null
}

const handleLogout = async () => {
  try {
    loggingOut.value = true
    await supabase.auth.signOut()
    router.replace('/login')
  } finally {
    loggingOut.value = false
  }
}

// Get user data
const getActiveUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  if (profile) {
    userName.value = profile.full_name || 'User'
    userRole.value = profile.role
  } else {
    const fallback = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    userName.value = fallback
  }
}

// PWA handlers
const handleBeforeInstallPrompt = (e: any) => {
  e.preventDefault()
  deferredPrompt.value = e
}

const handleAppInstalled = () => {
  isInstalled.value = true
  deferredPrompt.value = null
}

// Lifecycle
onMounted(() => {
  getActiveUser()

  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                (window.navigator as any).standalone === true
  isInstalled.value = isPWA

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.addEventListener('appinstalled', handleAppInstalled)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>