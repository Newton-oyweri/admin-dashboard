<!-- src/views/DeliveryPortal.vue -->
<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-6 space-y-6 sm:px-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50 antialiased">
    <Navbar />

    <div class="max-w-3xl mx-auto space-y-6">
      <div class="border-b border-zinc-200/80 dark:border-zinc-800/80 pb-5">
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl text-zinc-900 dark:text-white">Courier Fulfillment Portal</h1>
        <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Enter order reference numbers, update delivery status, and notify customers when their delivery has arrived.
        </p>
      </div>

      <!-- Search Layout UI Row -->
      <form @submit.prevent="handleSearch" class="flex gap-2 bg-white dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <input
          type="text"
          placeholder="Search Order Number (e.g., ORD-0029841)"
          v-model="orderNumber"
          class="flex-1 bg-transparent px-3 py-2 text-sm outline-none border-0 focus:ring-0 placeholder-zinc-400 dark:placeholder-zinc-500 font-mono tracking-wide"
        />
        <button
          type="submit"
          :disabled="searching"
          class="px-5 py-2 bg-zinc-950 dark:bg-zinc-50 hover:bg-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-950 text-xs font-semibold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer"
        >
          {{ searching ? 'Searching...' : 'Find Package' }}
        </button>
      </form>

      <div v-if="error" class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-xs sm:text-sm text-amber-800 dark:text-amber-400 font-medium">
        {{ error }}
      </div>

      <!-- Search Results Display Card -->
      <div v-if="order" class="border rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 flex flex-col space-y-6 shadow-sm">
        <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div class="flex items-start gap-4 min-w-0">
            <img
              v-if="order.products?.image_urls && order.products.image_urls.length > 0"
              :src="order.products.image_urls[0]"
              alt="Product Cargo Image"
              class="w-14 h-14 object-cover rounded-xl border border-zinc-200/60 dark:border-zinc-800 shrink-0 shadow-sm"
            />
            <div v-else class="w-14 h-14 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/60 rounded-xl flex items-center justify-center text-[9px] font-medium text-zinc-400 tracking-wider uppercase shrink-0">
              📦 Treat
            </div>

            <div class="min-w-0 space-y-1">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h3 class="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate">
                  {{ order.products?.name || notesDetails.productName || 'Product Cargo' }}
                </h3>
                <span class="inline-flex items-center text-[10px] tracking-wider font-mono font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50">
                  #{{ order.order_number }}
                </span>
              </div>

              <div class="text-xs text-zinc-500 dark:text-zinc-400 space-y-0.5">
                <p>Recipient: <strong class="text-zinc-800 dark:text-zinc-200 font-medium">{{ order.profiles?.full_name || 'Guest Check-out' }}</strong></p>
                <p>Quantity Footprint: <strong class="text-zinc-800 dark:text-zinc-200 font-medium">{{ order.quantity }} Count</strong></p>
              </div>
            </div>
          </div>

          <div class="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border self-start" :class="getStatusDisplay(order.status)?.container">
            {{ getStatusDisplay(order.status)?.label }}
          </div>
        </div>

        <!-- Address notes rendering blocks -->
        <div v-if="notesDetails.customWriting || notesDetails.deliveryAddress" class="grid grid-cols-1 gap-4 bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/50 dark:border-zinc-800/60 p-4 rounded-xl text-xs sm:text-sm">
          <div v-if="notesDetails.deliveryAddress" class="space-y-1.5">
            <span class="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Drop-off Coordinates ({{ notesDetails.fulfillmentMethod?.replace('_', ' ') || 'Standard Courier' }})
            </span>
            <p class="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed bg-white dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm">
              {{ notesDetails.deliveryAddress }}
            </p>
          </div>
        </div>

        <!-- Mutation Flow Action Triggers Bar -->
        <div class="border-t border-zinc-100 dark:border-zinc-900 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="text-xs text-zinc-400 dark:text-zinc-500">
            Created: {{ formatDate(order.created_at) }}
          </div>

          <!-- ✅ Updated action buttons with delivery person logic -->
          <div class="flex items-center gap-2 justify-end">
            <!-- Show message when order is not ready for delivery -->
            <div v-if="order.status && !['ready', 'pickup', 'delivered'].includes(order.status)" 
                 class="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 px-3 py-1.5 rounded-lg">
              ⏳ Order is being prepared by the seller
            </div>

            <!-- Pickup button - ONLY show when status is 'ready' -->
            <button
              v-if="order.status === 'ready'"
              type="button"
              :disabled="updating"
              @click="handleStatusChange('pickup')"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap"
            >
              {{ updating ? 'Processing...' : '📱 Mark as Arrived (Notify Customer)' }}
            </button>

            <!-- Delivered button - ONLY show when status is 'pickup' -->
            <button
              v-if="order.status === 'pickup'"
              type="button"
              :disabled="updating"
              @click="handleStatusChange('delivered')"
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-sm whitespace-nowrap"
            >
              {{ updating ? 'Fulfilling...' : '✅ Confirm Delivered' }}
            </button>

            <!-- Show delivered success message -->
            <p v-if="order.status === 'delivered'" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/[0.04] border border-emerald-500/10 px-3 py-1.5 rounded-lg">
              🎉 Product Delivered Successfully
            </p>
          </div>
        </div>

        <!-- Delivery status timeline -->
        <div v-if="order.status" class="border-t border-zinc-100 dark:border-zinc-900 pt-4">
          <div class="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span class="font-medium">Delivery Status:</span>
            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center gap-1" 
                    :class="getStatusStepClass('pending', order.status)">
                <span class="w-1.5 h-1.5 rounded-full" 
                      :class="getStatusDotClass('pending', order.status)"></span>
                Pending
              </span>
              <span class="text-zinc-300 dark:text-zinc-700">→</span>
              <span class="inline-flex items-center gap-1"
                    :class="getStatusStepClass('ready', order.status)">
                <span class="w-1.5 h-1.5 rounded-full"
                      :class="getStatusDotClass('ready', order.status)"></span>
                Ready
              </span>
              <span class="text-zinc-300 dark:text-zinc-700">→</span>
              <span class="inline-flex items-center gap-1"
                    :class="getStatusStepClass('pickup', order.status)">
                <span class="w-1.5 h-1.5 rounded-full"
                      :class="getStatusDotClass('pickup', order.status)"></span>
                Picked Up
              </span>
              <span class="text-zinc-300 dark:text-zinc-700">→</span>
              <span class="inline-flex items-center gap-1"
                    :class="getStatusStepClass('delivered', order.status)">
                <span class="w-1.5 h-1.5 rounded-full"
                      :class="getStatusDotClass('delivered', order.status)"></span>
                Delivered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

interface OrderWithDetails {
  id: string
  customer_id: string
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
  total_amount: number
  status: string
  notes: string | null
  created_at: string | null
  updated_at: string | null
  delivery_person_id: string | null
  order_number: string | null
  products?: {
    id: string
    name: string
    image_urls?: string[] | null
  } | null
  profiles?: {
    id: string
    full_name?: string | null
  } | null
}

interface ParsedNotes {
  customWriting?: string
  fulfillmentMethod?: string
  deliveryAddress?: string
  productName?: string
}

// State
const orderNumber = ref('')
const order = ref<OrderWithDetails | null>(null)
const searching = ref(false)
const updating = ref(false)
const error = ref<string | null>(null)

// Status map constants
const STATUS_MAP: Record<string, { label: string; container: string }> = {
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
    label: 'Ready for Pickup', 
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
  },
  pickup: { 
    label: 'Picked Up', 
    container: 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' 
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
    label: 'Processing', 
    container: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50' 
  },
}

// Helper function for status display
function getStatusDisplay(status: string | null | undefined) {
  if (!status) return STATUS_MAP.default
  return STATUS_MAP[status] || STATUS_MAP.default
}

// Helper functions for status timeline
function getStatusStepClass(step: string, currentStatus: string) {
  const steps = ['pending', 'ready', 'pickup', 'delivered']
  const currentIndex = steps.indexOf(currentStatus)
  const stepIndex = steps.indexOf(step)
  
  if (currentIndex === -1 || stepIndex === -1) return 'text-zinc-400'
  if (stepIndex < currentIndex) return 'text-emerald-600 dark:text-emerald-400'
  if (stepIndex === currentIndex) return 'text-blue-600 dark:text-blue-400 font-semibold'
  return 'text-zinc-400 dark:text-zinc-500'
}

function getStatusDotClass(step: string, currentStatus: string) {
  const steps = ['pending', 'ready', 'pickup', 'delivered']
  const currentIndex = steps.indexOf(currentStatus)
  const stepIndex = steps.indexOf(step)
  
  if (currentIndex === -1 || stepIndex === -1) return 'bg-zinc-300'
  if (stepIndex < currentIndex) return 'bg-emerald-500'
  if (stepIndex === currentIndex) return 'bg-blue-500 animate-pulse'
  return 'bg-zinc-300 dark:bg-zinc-600'
}

// Computed Properties
const notesDetails = computed<ParsedNotes>(() => {
  if (!order.value?.notes) return {}
  try {
    return JSON.parse(order.value.notes)
  } catch {
    return { customWriting: order.value.notes }
  }
})

// Methods
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const updateOrderStatus = async (orderId: string, nextStatus: 'pickup' | 'delivered'): Promise<boolean> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Action rejected: Unauthenticated user.')
      return false
    }

    // Verify user has delivery role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const allowedRoles = ['delivery_person', 'admin']
    if (profileError || !profile || !allowedRoles.includes(profile.role)) {
      console.error(`Action rejected: User ${user.id} does not have delivery clearance.`)
      return false
    }
    
    // ✅ Additional check: Only allow update if current status is 'ready' for pickup, or 'pickup' for delivered
    const currentOrder = order.value
    if (currentOrder) {
      if (nextStatus === 'pickup' && currentOrder.status !== 'ready') {
        console.error(`Cannot mark as pickup: Order status is "${currentOrder.status}", expected "ready"`)
        alert('This order is not yet ready for pickup. Please wait for the seller to mark it as ready.')
        return false
      }
      if (nextStatus === 'delivered' && currentOrder.status !== 'pickup') {
        console.error(`Cannot mark as delivered: Order status is "${currentOrder.status}", expected "pickup"`)
        alert('This order has not been marked as picked up yet.')
        return false
      }
    }

    const { error: patchError } = await supabase
      .from('orders')
      .update({ 
        status: nextStatus,
        delivery_person_id: user.id, // ✅ Track which delivery person handled this
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)

    if (patchError) {
      console.error(`Failed to update status to ${nextStatus}:`, patchError.message)
      return false
    }

    return true
  } catch (err) {
    console.error('Error in updateOrderStatus server action:', err)
    return false
  }
}

const handleSearch = async () => {
  if (!orderNumber.value.trim()) return

  searching.value = true
  error.value = null
  order.value = null

  try {
    const { data, error: dbError } = await supabase
      .from('orders')
      .select(`
        *,
        products(*),
        profiles:profiles!orders_customer_id_fkey(*)
      `)
      .eq('order_number', orderNumber.value.trim())
      .maybeSingle()

    if (dbError) throw dbError

    if (data) {
      order.value = data as unknown as OrderWithDetails
    } else {
      error.value = `No active order records found for code "${orderNumber.value}".`
    }
  } catch (err: any) {
    console.error('Search Error Detail:', err)
    error.value = err?.message || 'Failed to search the database framework for this order number.'
  } finally {
    searching.value = false
  }
}

const handleStatusChange = async (targetStatus: 'pickup' | 'delivered') => {
  if (!order.value) return
  
  // ✅ Validate status transition based on current status
  if (targetStatus === 'pickup' && order.value.status !== 'ready') {
    alert('This order must be marked as "Ready" by the seller before you can pick it up.')
    return
  }
  
  if (targetStatus === 'delivered' && order.value.status !== 'pickup') {
    alert('This order must be marked as "Picked Up" before you can confirm delivery.')
    return
  }
  
  const confirmationPrompt = targetStatus === 'pickup' 
    ? 'Confirm you have picked up this order? This will notify the customer.'
    : 'Confirm that the product has been delivered to the customer?'
    
  if (!window.confirm(confirmationPrompt)) return

  updating.value = true
  try {
    const success = await updateOrderStatus(order.value.id, targetStatus)
    if (success) {
      order.value = { ...order.value, status: targetStatus }
      if (targetStatus === 'pickup') {
        alert('✅ Order marked as picked up! Customer has been notified.')
      } else {
        alert('✅ Order marked as delivered!')
      }
    } else {
      alert('Failed to update status. Please try again.')
    }
  } catch (err) {
    console.error('Error updating status:', err)
    alert('An error occurred. Please try again.')
  } finally {
    updating.value = false
  }
}
</script>