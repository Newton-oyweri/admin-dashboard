<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50 antialiased">

    <!-- Header Section -->
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

    <!-- Tab Selector -->
    <div class="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80">
      <button
        @click="setTab('orders')"
        class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer"
        :class="tab === 'orders'
          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
          : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'"
      >
        Orders <span class="ml-1 text-xs text-zinc-400">({{ orders.length }})</span>
      </button>
      <button
        @click="setTab('bookings')"
        class="px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer"
        :class="tab === 'bookings'
          ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
          : 'border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'"
      >
        Bookings <span class="ml-1 text-xs text-zinc-400">({{ bookings.length }})</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-20 flex flex-col items-center justify-center space-y-3 shadow-xs">
      <div class="h-7 w-7 animate-spin rounded-full border-[2.5px] border-zinc-900 dark:border-zinc-100 border-t-transparent"></div>
      <p class="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="activeList.length === 0" class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 py-24 px-4 text-center shadow-xs">
      <h3 class="text-base font-semibold text-zinc-900 dark:text-zinc-100">All caught up</h3>
      <p class="text-zinc-500 dark:text-zinc-400 text-sm font-medium mt-1 max-w-sm mx-auto">
        {{ tab === 'orders'
          ? 'No live orders found right now. Once clients check out items from your shop listings, they will show up right here.'
          : 'No booking requests found right now. Once clients submit a booking, it will show up right here.' }}
      </p>
    </div>

    <!-- Orders Tab Content -->
    <OrderList
      v-else-if="tab === 'orders'"
      :orders="orders"
      @open-progress-modal="openProgressModal"
      @open-cancel-modal="openCancelModal"
    />

    <!-- Bookings Tab Content -->
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

    <!-- Modals -->
    <div v-if="showProgressModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div class="space-y-1">
          <h3 class="text-lg font-bold text-zinc-900 dark:text-white">
            Confirm Order Action
          </h3>
          <p class="text-sm text-zinc-500 dark:text-zinc-400">
            Are you sure you want to change order status to <strong class="text-zinc-900 dark:text-white uppercase font-bold">{{ targetStatus?.replace('_', ' ') }}</strong>?
          </p>
        </div>

        <div v-if="selectedOrder" class="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
          <div><span class="text-zinc-400">Order:</span> <strong class="text-zinc-800 dark:text-zinc-200">#{{ selectedOrder.order_number }}</strong></div>
          <div><span class="text-zinc-400">Total:</span> <strong class="text-zinc-800 dark:text-zinc-200">KES {{ Number(selectedOrder.total_amount ?? 0).toLocaleString() }}</strong></div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="closeModals"
            :disabled="actionLoading"
            class="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="confirmStatusProgression"
            :disabled="actionLoading"
            class="px-5 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <span v-if="actionLoading" class="w-3 h-3 border-2 border-white dark:border-zinc-900 border-t-transparent rounded-full animate-spin"></span>
            Confirm Action
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div class="space-y-1">
          <h3 class="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            Cancel Order &amp; Issue Refund
          </h3>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            This action will cancel order <strong class="text-zinc-800 dark:text-zinc-200">#{{ selectedOrder?.order_number }}</strong> and refund <strong class="text-zinc-800 dark:text-zinc-200">KES {{ Number(selectedOrder?.total_amount ?? 0).toLocaleString() }}</strong> directly back to the customer's wallet.
          </p>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Reason for Cancellation
          </label>
          <textarea
            v-model="cancelReason"
            rows="3"
            placeholder="e.g. Out of stock, kitchen busy, customer requested..."
            class="w-full text-xs p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            @click="closeModals"
            :disabled="actionLoading"
            class="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            Keep Order
          </button>
          <button
            @click="confirmCancellation"
            :disabled="actionLoading"
            class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-rose-600/20"
          >
            <span v-if="actionLoading" class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Confirm &amp; Refund
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import {
  getSessionUser,
  fetchSellerOrders,
  fetchSellerBookings,
  updateOrderStatus
} from '@/composables/useOrders'
import type { OrderWithDetails, Tab } from '@/types/orders'
import OrderList from './order.vue'

// State
const tab = ref<Tab>('orders')
const orders = ref<OrderWithDetails[]>([])
const bookings = ref<OrderWithDetails[]>([])
const loading = ref(true)
const sellerId = ref<string | null>(null)

// Modal States
const showProgressModal = ref(false)
const showCancelModal = ref(false)
const selectedOrder = ref<OrderWithDetails | null>(null)
const targetStatus = ref<string | null>(null)
const cancelReason = ref('Cancelled by seller')
const actionLoading = ref(false)

// Computed
const activeList = computed(() => {
  return tab.value === 'orders' ? orders.value : bookings.value
})

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
  } catch {
    orders.value = []
    bookings.value = []
  } finally {
    loading.value = false
  }
}

// Modal Handlers
const openProgressModal = (order: OrderWithDetails, nextStatus: string) => {
  selectedOrder.value = order
  targetStatus.value = nextStatus
  showProgressModal.value = true
}

const openCancelModal = (order: OrderWithDetails) => {
  selectedOrder.value = order
  cancelReason.value = 'Cancelled by seller'
  showCancelModal.value = true
}

const closeModals = () => {
  showProgressModal.value = false
  showCancelModal.value = false
  selectedOrder.value = null
  targetStatus.value = null
  actionLoading.value = false
}

// Actions
const confirmStatusProgression = async () => {
  if (!selectedOrder.value || !targetStatus.value || !sellerId.value) return

  actionLoading.value = true
  try {
    const success = await updateOrderStatus(selectedOrder.value.id, targetStatus.value)
    if (success) {
      closeModals()
      await loadData(sellerId.value)
    } else {
      alert('Failed to update status.')
    }
  } catch {
    alert('An error occurred. Please try again.')
  } finally {
    actionLoading.value = false
  }
}

const confirmCancellation = async () => {
  if (!selectedOrder.value || !sellerId.value) return

  actionLoading.value = true
  try {
    const { data, error } = await supabase.rpc('cancel_order_and_refund', {
      p_order_id: selectedOrder.value.id,
      p_seller_id: sellerId.value,
      p_cancellation_reason: cancelReason.value
    })

    if (error) throw error

    if (data?.success) {
      closeModals()
      await loadData(sellerId.value)
    } else {
      alert(data?.error || 'Failed to cancel order.')
    }
  } catch (error: any) {
    alert(error?.message || 'Failed to execute order cancellation.')
  } finally {
    actionLoading.value = false
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
  } catch {
    alert('Failed to load. Please refresh and try again.')
  }
})
</script>

