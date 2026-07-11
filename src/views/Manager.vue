<template>
  <div class="w-full max-w-7xl mx-auto p-4 space-y-8 text-zinc-900 dark:text-zinc-50">
    
    <div class="flex flex-wrap justify-between items-center gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Admin Control Center</h1>
        <p class="text-xs text-zinc-500">Manage categories, view global ledger assets, and process seller payouts.</p>
      </div>
      <div v-if="platformWallet" class="flex gap-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl">
        <div>Platform Commissions: <span class="font-bold text-emerald-600">KES {{ Number(platformWallet.total_commissions).toLocaleString() }}</span></div>
        <div>Total Revenue (Seller Due): <span class="font-bold text-pink-600">KES {{ Number(platformWallet.total_revenue).toLocaleString() }}</span></div>
        <div>Total Paid Out: <span class="font-bold text-zinc-500">KES {{ Number(platformWallet.total_payouts).toLocaleString() }}</span></div>
      </div>
    </div>

    <div class="space-y-4">
      <h2 class="text-lg font-bold tracking-tight">Seller Payout Ledger (Debts Owed)</h2>
      <div v-if="loading" class="text-xs text-zinc-400">Loading ledger balances...</div>
      <div v-else-if="sellers.length === 0" class="text-xs text-zinc-400">No seller wallets found in database registry.</div>
      <div v-else class="border rounded-xl bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
        <div v-for="seller in sellers" :key="seller.id" class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <p class="font-bold text-sm">{{ seller.profiles?.full_name || 'Unnamed Seller' }}</p>
            <p class="text-[10px] text-zinc-400">{{ seller.profiles?.phone || 'No phone' }}</p>
            <p class="text-[10px] text-zinc-500 mt-1">Total Earned: KES {{ Number(seller.total_earned).toLocaleString() }}</p>
          </div>
          
          <div class="flex items-center gap-4 self-end sm:self-center">
            <div class="text-right">
              <span class="block text-[10px] uppercase font-semibold text-zinc-400">Amount Owed</span>
              <span class="text-sm font-bold" :class="Number(seller.available_balance) > 0 ? 'text-pink-600' : 'text-zinc-400'">
                KES {{ Number(seller.available_balance).toLocaleString() }}
              </span>
            </div>
            <button
              @click="handlePayout(seller.seller_id, Number(seller.available_balance))"
              :disabled="Number(seller.available_balance) <= 0 || paying"
              class="px-3 py-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Clear Owed Balance
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <AdminCategories 
        :categories="categories" 
        @update:categories="fetchCategories"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminCategories from './AdminCategories.vue'

interface SellerWallet {
  id: string;
  seller_id: string;
  available_balance: number;
  total_earned: number;
  profiles: { full_name: string | null; phone: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  subtitle: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface PlatformWallet {
  total_revenue: number;
  total_commissions: number;
  total_payouts: number;
}

const sellers = ref<SellerWallet[]>([])
const categories = ref<Category[]>([])
const platformWallet = ref<PlatformWallet | null>(null)

const loading = ref(false)
const paying = ref(false)

const fetchAdminLedgerData = async () => {
  loading.value = true
  
  // Fetch from platform_wallet table
  const { data: pfData } = await supabase
    .from('platform_wallet')
    .select('total_revenue, total_commissions, total_payouts')
    .limit(1)
    .maybeSingle()
  
  if (pfData) platformWallet.value = pfData

  await fetchCategories()
  
  const { data: sellData } = await supabase
    .from('seller_wallets')
    .select('id, seller_id, available_balance, total_earned, profiles(full_name, phone)')
    .order('available_balance', { ascending: false })
  
  if (sellData) sellers.value = sellData as unknown as SellerWallet[]
  loading.value = false
}

const fetchCategories = async () => {
  const { data: catData } = await supabase.from('categories').select('*').order('display_order', { ascending: true })
  if (catData) categories.value = catData
}

const handlePayout = async (sellerId: string, amount: number) => {
  if (amount <= 0) return
  if (!confirm(`Confirm execution of KES ${amount.toLocaleString()} transaction settlement payout directly from system revenue?`)) return
  
  paying.value = true
  try {
    const { data, error } = await supabase.rpc('process_seller_payout', {
      p_seller_id: sellerId,
      p_amount: amount
    })
    if (error) throw error
    if (data?.success) {
      alert(`✅ Payout complete: ${data.message}`)
      await fetchAdminLedgerData()
    } else {
      alert(`⚠️ Operation halted by DB: ${data?.message}`)
    }
  } catch (err) {
    alert('❌ Transaction exception: ' + (err as Error).message)
  } finally {
    paying.value = false
  }
}

onMounted(() => {
  fetchAdminLedgerData()
})
</script>