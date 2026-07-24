<template>
  <div class="space-y-8">
    
    <!-- SECTION 1: Active Orders (In Progress) -->
    <section v-if="activeOrders.length > 0" class="space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <h2 class="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          Active Orders ({{ activeOrders.length }})
        </h2>
      </div>

      <div class="space-y-4 sm:space-y-6">
        <div
          v-for="order in activeOrders"
          :key="order.id"
          class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 flex flex-col space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 shadow-xs"
        >
          <!-- Top Row: Product & Price -->
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
                Paid
              </span>
              <span class="text-lg sm:text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 leading-none">
                KES {{ Number(order.total_amount ?? 0).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- Order Progress Stepper -->
          <div class="bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60 p-4 rounded-xl space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
              Fulfillment Stage
            </span>
            <div class="flex items-center justify-between text-xs font-semibold">
              <div
                v-for="(step, index) in steps"
                :key="step.key"
                class="flex items-center gap-2"
                :class="getStepIndex(order.status) >= index ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-400 dark:text-zinc-600'"
              >
                <div
                  class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all"
                  :class="getStepIndex(order.status) >= index
                    ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-400'"
                >
                  {{ index + 1 }}
                </div>
                <span class="hidden sm:inline">{{ step.label }}</span>
                <span v-if="index < steps.length - 1" class="text-zinc-300 dark:text-zinc-700 ml-2">→</span>
              </div>
            </div>
          </div>

          <!-- Order Notes / Requests -->
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

          <!-- Prominent Actions for Incoming Pending Orders -->
          <div v-if="order.status === 'pending'" class="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="space-y-1 text-center sm:text-left">
              <h4 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                New Order Received
              </h4>
              <p class="text-xs text-zinc-500 dark:text-zinc-400">
                Review order details before accepting or cancelling.
              </p>
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto">
              <button
                @click="emit('openCancelModal', order)"
                class="flex-1 sm:flex-none px-5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-sm font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                Cancel Order
              </button>
              <button
                @click="emit('openProgressModal', order, 'accepted')"
                class="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer shadow-sm shadow-emerald-600/20"
              >
                Accept Order
              </button>
            </div>
          </div>

          <!-- Progression Footer for Accepted / In Progress -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-900">
            <div class="flex items-center text-xs text-zinc-400 dark:text-zinc-500">
              <span>Received: {{ formatDate(order.created_at) }}</span>
            </div>

            <div class="flex items-center justify-between sm:justify-end gap-3">
              <div class="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border" :class="getStatusBadge(order.status)?.container">
                {{ getStatusBadge(order.status)?.label }}
              </div>

              <button
                v-if="order.status && ['accepted', 'in_progress'].includes(order.status)"
                @click="emit('openProgressModal', order, getNextStatus(order.status))"
                class="px-4 py-1.5 bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap"
              >
                {{ order.status === 'accepted' ? 'Start Preparation' : '' }}
                {{ order.status === 'in_progress' ? 'Mark Ready for Dispatch' : '' }}
              </button>

              <button
                v-if="order.status && ['accepted', 'in_progress'].includes(order.status)"
                @click="emit('openCancelModal', order)"
                class="px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: Ready & Dispatched Orders -->
    <section v-if="dispatchedOrders.length > 0" class="space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <h2 class="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          Ready & Dispatched ({{ dispatchedOrders.length }})
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="order in dispatchedOrders"
          :key="order.id"
          class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 flex flex-col space-y-4 shadow-xs"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-base text-zinc-900 dark:text-zinc-100">
                  {{ order.products?.name || 'Product Listing' }}
                </h3>
                <span v-if="order.order_number" class="text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400">
                  #{{ order.order_number }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Customer: <strong class="text-zinc-700 dark:text-zinc-300 font-medium">{{ order.profiles?.full_name || 'Guest' }}</strong>
              </p>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border" :class="getStatusBadge(order.status)?.container">
                {{ getStatusBadge(order.status)?.label }}
              </span>
              <span class="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                KES {{ Number(order.total_amount ?? 0).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: Cancelled Orders -->
    <section v-if="cancelledOrders.length > 0" class="space-y-4">
      <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <h2 class="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-rose-500"></span>
          Cancelled & Refunded ({{ cancelledOrders.length }})
        </h2>
      </div>

      <div class="space-y-4">
        <div
          v-for="order in cancelledOrders"
          :key="order.id"
          class="border rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/50 border-zinc-200/60 dark:border-zinc-800/60 p-5 flex flex-col space-y-3 opacity-80"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-base text-zinc-800 dark:text-zinc-200 line-through">
                  {{ order.products?.name || 'Product Listing' }}
                </h3>
                <span v-if="order.order_number" class="text-[10px] font-mono font-bold bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400">
                  #{{ order.order_number }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Customer: {{ order.profiles?.full_name || 'Guest' }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
                Cancelled
              </span>
              <span class="text-sm font-semibold text-zinc-500 line-through">
                KES {{ Number(order.total_amount ?? 0).toLocaleString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { OrderWithDetails, ParsedNotes } from '@/types/orders'

const props = defineProps<{
  orders: OrderWithDetails[]
}>()

const emit = defineEmits<{
  (e: 'openProgressModal', order: OrderWithDetails, nextStatus: string): void
  (e: 'openCancelModal', order: OrderWithDetails): void
}>()

const steps = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'Preparing' },
  { key: 'ready', label: 'Ready / Dispatched' }
]

// Categorized Order Computeds
const activeOrders = computed(() => {
  return props.orders.filter(o => ['pending', 'accepted', 'in_progress'].includes(o.status || ''))
})

const dispatchedOrders = computed(() => {
  return props.orders.filter(o => ['ready', 'delivered'].includes(o.status || ''))
})

const cancelledOrders = computed(() => {
  return props.orders.filter(o => o.status === 'cancelled')
})

function getStepIndex(status: string | null | undefined): number {
  switch (status) {
    case 'pending': return 0
    case 'accepted': return 1
    case 'in_progress': return 2
    case 'ready':
    case 'delivered': return 3
    default: return -1
  }
}

function getNotesDetails(notes: string | null): ParsedNotes {
  if (!notes) return {}
  try {
    return JSON.parse(notes)
  } catch {
    return { customWriting: notes }
  }
}

function getNextStatus(currentStatus: string): string {
  if (currentStatus === 'pending') return 'accepted'
  if (currentStatus === 'accepted') return 'in_progress'
  if (currentStatus === 'in_progress') return 'ready'
  return currentStatus
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

  if (!status) return map.default
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
</script>

