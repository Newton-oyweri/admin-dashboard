<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50 antialiased">

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">
          Orders &amp; Bookings
        </h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Track incoming sales and booking requests, and manage them from one place.
        </p>
      </div>
      <div class="inline-flex items-center self-start sm:self-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-400 shadow-xs">
        Active: <span class="font-bold ml-1.5 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/40">{{ activeList.length }}</span>
      </div>
    </div>

    <div class="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <button
        @click="setTab('orders')"
        class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors"
        :class="tab === 'orders' 
          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' 
          : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'"
      >
        Orders <span class="ml-1 text-xs text-zinc-400">({{ orders.length }})</span>
      </button>
      <button
        @click="setTab('bookings')"
        class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors"
        :class="tab === 'bookings' 
          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' 
          : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'"
      >
        Bookings <span class="ml-1 text-xs text-zinc-400">({{ bookings.length }})</span>
      </button>
    </div>

    <div v-if="loading" class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-20 flex flex-col items-center justify-center space-y-3 shadow-xs">
      <div class="h-7 w-7 animate-spin rounded-full border-[2.5px] border-zinc-900 dark:border-zinc-100 border-t-transparent"></div>
      <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading...</p>
    </div>

    <div v-else-if="activeList.length === 0" class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 py-24 px-4 text-center shadow-xs">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 mb-3 text-xl">
        👋
      </div>
      <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">All caught up!</h3>
      <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1 max-w-sm mx-auto">
        {{ tab === 'orders' 
          ? 'No live orders found right now. Once clients check out items from your shop listings, they will show up right here.'
          : 'No booking requests found right now. Once clients submit a booking, it will show up right here.' }}
      </p>
    </div>

    <div v-else-if="tab === 'orders'" class="space-y-4 sm:space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 flex flex-col space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 shadow-xs"
      >
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-start gap-4 min-w-0">
            <img
              v-if="order.products?.image_urls && order.products.image_urls.length > 0"
              :src="order.products.image_urls[0]"
              :alt="order.products?.name || 'Product'"
              class="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border border-zinc-200/60 dark:border-zinc-800 shrink-0 shadow-2xs"
            />
            <div v-else class="w-14 h-14 sm:w-16 sm:h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl flex items-center justify-center text-[10px] font-medium text-zinc-400 tracking-wider uppercase shrink-0">
              No Image
            </div>

            <div class="min-w-0 space-y-1">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h3 class="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug truncate">
                  {{ order.products?.name || getNotesDetails(order.notes).productName || 'Product Listing' }}
                </h3>
                <span v-if="order.order_number" class="inline-flex items-center text-[10px] tracking-wider font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                  #{{ order.order_number }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Customer: <strong class="text-zinc-800 dark:text-zinc-200 font-medium">{{ order.profiles?.full_name || 'Guest Checkout' }}</strong></span>
                <span class="text-zinc-300 dark:text-zinc-700">•</span>
                <span>Quantity: <strong class="text-zinc-800 dark:text-zinc-200 font-medium">{{ order.quantity }}</strong></span>
              </div>
            </div>
          </div>

          <div class="flex items-center sm:items-end justify-between sm:flex-col gap-1.5 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.02] border border-emerald-500/10 p-3 rounded-xl min-w-[150px] self-start sm:self-auto w-full sm:w-auto">
            <span class="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
              ✓ Paid
            </span>
            <span class="text-lg sm:text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 leading-none">
              KES {{ Number(order.total_amount ?? 0).toLocaleString() }}
            </span>
          </div>
        </div>

        <div v-if="getNotesDetails(order.notes).customWriting || getNotesDetails(order.notes).deliveryAddress" class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4 rounded-xl text-xs sm:text-sm">
          <div v-if="getNotesDetails(order.notes).customWriting" class="space-y-1.5">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Customer Request
            </span>
            <p class="text-zinc-800 dark:text-zinc-200 font-medium bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xs">
              {{ getNotesDetails(order.notes).customWriting }}
            </p>
          </div>

          <div v-if="getNotesDetails(order.notes).deliveryAddress" class="space-y-1.5">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Fulfillment Address ({{ getNotesDetails(order.notes).fulfillmentMethod?.replace('_', ' ') || 'Standard Courier' }})
            </span>
            <p class="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xs">
              {{ getNotesDetails(order.notes).deliveryAddress }}
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-900">
          <div class="flex items-center text-xs text-zinc-400 dark:text-zinc-500">
            <span>Received: {{ formatDate(order.created_at) }}</span>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-3">
            <div class="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border" :class="getStatusBadge(order.status)?.container">
              {{ getStatusBadge(order.status)?.label }}
            </div>

            <button
              v-if="order.status && ['pending', 'accepted', 'in_progress'].includes(order.status)"
              @click="handleStateProgression(order.id, order.status)"
              class="px-4 py-1.5 bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap"
            >
              {{ order.status === 'pending' ? 'Accept Order' : '' }}
              {{ order.status === 'accepted' ? 'Start Preparation' : '' }}
              {{ order.status === 'in_progress' ? 'Mark Ready' : '' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4 sm:space-y-6">
      <div
        v-for="booking in bookings"
        :key="booking.id"
        class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 flex flex-col space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 shadow-xs"
      >
        <div class="flex items-center gap-2.5 flex-wrap">
          <h3 class="font-semibold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
            Booking Request
          </h3>
          <span v-if="booking.order_number" class="inline-flex items-center text-[10px] tracking-wider font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
            #{{ booking.order_number }}
          </span>
        </div>

        <div class="text-xs text-zinc-500 dark:text-zinc-400">
          Customer: <strong class="text-zinc-800 dark:text-zinc-200 font-medium">{{ booking.profiles?.full_name || 'Guest' }}</strong>
        </div>

        <div v-if="booking.notes" class="bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4 rounded-xl">
          <span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Booking Details
          </span>
          <p class="text-zinc-800 dark:text-zinc-200 text-sm font-medium whitespace-pre-line leading-relaxed bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-2xs">
            {{ booking.notes }}
          </p>
        </div>

        <div class="text-xs text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-900">
          Received: {{ formatDate(booking.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  getSessionUser, 
  fetchSellerOrders, 
  fetchSellerBookings, 
  updateOrderStatus 
} from '@/composables/useOrders'
import type { OrderWithDetails, ParsedNotes, Tab } from '@/types/orders'

// State
const tab = ref<Tab>('orders')
const orders = ref<OrderWithDetails[]>([])
const bookings = ref<OrderWithDetails[]>([])
const loading = ref(true)
const sellerId = ref<string | null>(null)

// Computed
const activeList = computed(() => {
  return tab.value === 'orders' ? orders.value : bookings.value
})

// Helper functions
function getNotesDetails(notes: string | null): ParsedNotes {
  if (!notes) return {}
  try {
    return JSON.parse(notes)
  } catch {
    return { customWriting: notes }
  }
}

function getStatusBadge(status: string | null | undefined) {
  const map: Record<string, { label: string; container: string }> = {
    pending: { 
      label: 'Pending', 
      container: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' 
    },
    accepted: { 
      label: 'Accepted', 
      container: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' 
    },
    in_progress: { 
      label: 'In Progress', 
      container: 'bg-purple-50 text-purple-700 border-purple-200/60 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30' 
    },
    ready: { 
      label: 'Ready', 
      container: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
    },
    delivered: { 
      label: 'Delivered', 
      container: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30' 
    },
    cancelled: {
      label: 'Cancelled',
      container: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
    },
    default: { 
      label: 'Unknown', 
      container: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50' 
    }
  }

  // If status is null, undefined, or an empty string, immediately return the default badge
  if (!status) {
    return map.default
  }

  return map[status] || map.default
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Methods
const setTab = (newTab: Tab) => {
  tab.value = newTab
}

const loadData = async (id: string) => {
  loading.value = true
  try {
    const [serverOrders, serverBookings] = await Promise.all([
      fetchSellerOrders(id),
      fetchSellerBookings(id),
    ])
    orders.value = serverOrders || []
    bookings.value = serverBookings || []
  } catch (error) {
    console.error('Error loading data:', error)
    orders.value = []
    bookings.value = []
  } finally {
    loading.value = false
  }
}

const handleStateProgression = async (orderId: string, currentStatus: string) => {
  if (!sellerId.value || !currentStatus) return

  let nextStatus = currentStatus
  if (currentStatus === 'pending') nextStatus = 'accepted'
  else if (currentStatus === 'accepted') nextStatus = 'in_progress'
  else if (currentStatus === 'in_progress') nextStatus = 'ready'
  else return

  try {
    const success = await updateOrderStatus(orderId, nextStatus)
    if (success) {
      await loadData(sellerId.value)
    } else {
      alert('Failed to advance step.')
    }
  } catch (error) {
    console.error('Error updating status:', error)
    alert('An error occurred. Please try again.')
  }
}

// Lifecycle
onMounted(async () => {
  try {
    const user = await getSessionUser()
    if (user?.id) {
      sellerId.value = user.id
      await loadData(user.id)
    } else {
      alert('Session expired. Please sign in again.')
    }
  } catch (error) {
    console.error('Error initializing:', error)
    alert('Failed to load. Please refresh and try again.')
  }
})
</script>