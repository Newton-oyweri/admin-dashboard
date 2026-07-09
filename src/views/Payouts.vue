<!-- src/views/DashboardHome.vue -->
<template>
  <div class="mx-auto max-w-4xl px-4 py-8 space-y-8">
  
    
    <div>
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Seller Dashboard</h1>
      <p class="mt-2 text-sm text-zinc-500">Welcome to your WonderBakes seller dashboard.</p>
    </div>

    <div v-if="loading" class="text-sm text-zinc-500">
      Loading dashboard...
    </div>

    <template v-else>
      <!-- 1. Wallet Balances Overview -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Available Balance</span>
          <p class="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            KES {{ wallet?.available_balance?.toLocaleString() || '0.00' }}
          </p>
        </div>
        <div class="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm">
          <span class="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Earned</span>
          <p class="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            KES {{ wallet?.total_earned?.toLocaleString() || '0.00' }}
          </p>
        </div>
      </div>

      <!-- 2. Bank Details vs Bank Form -->
      <div v-if="bankDetails" class="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/30">
        <h2 class="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Payout Bank Account</h2>
        <div class="flex flex-wrap gap-x-8 gap-y-2 text-sm text-zinc-800 dark:text-zinc-200">
          <p><strong>Bank:</strong> {{ bankDetails.bank_name }}</p>
          <p><strong>Holder:</strong> {{ bankDetails.account_holder_name }}</p>
          <p><strong>Account:</strong> •••• {{ bankDetails.account_number?.slice(-4) }}</p>
        </div>
      </div>

      <div v-else class="rounded-xl border border-amber-200 bg-amber-50/40 p-6 dark:border-amber-900/30 dark:bg-amber-950/10">
        <h2 class="text-lg font-semibold text-amber-900 dark:text-amber-300">Add your bank details</h2>
        <p class="text-xs text-amber-800 dark:text-amber-400 mb-4">Provide details to receive your monthly payouts.</p>
        <form @submit.prevent="handleSaveBankDetails" class="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <input 
            type="text" 
            v-model="bankForm.bank_name" 
            required 
            placeholder="Bank Name" 
            class="flex-1 rounded-lg border p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700"
          />
          <input 
            type="text" 
            v-model="bankForm.account_holder_name" 
            required 
            placeholder="Holder Name" 
            class="flex-1 rounded-lg border p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700"
          />
          <input 
            type="text" 
            v-model="bankForm.account_number" 
            required 
            placeholder="Account Number" 
            class="flex-1 rounded-lg border p-2 text-sm bg-white dark:bg-zinc-800 dark:border-zinc-700"
          />
          <button 
            type="submit" 
            :disabled="isSaving" 
            class="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50 whitespace-nowrap"
          >
            {{ isSaving ? 'Saving...' : 'Save Details' }}
          </button>
        </form>
      </div>

      <!-- 3. Recent Transactions List -->
      <div class="space-y-3">
        <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-50">Recent Transactions</h2>
        <div class="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-medium">
                <th class="p-4">Description</th>
                <th class="p-4">Date</th>
                <th class="p-4">Type</th>
                <th class="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
              <tr v-if="transactions.length === 0">
                <td colspan="4" class="p-4 text-center text-zinc-400">No transactions recorded yet.</td>
              </tr>
              <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                <td class="p-4 font-medium text-zinc-900 dark:text-zinc-100">{{ tx.description }}</td>
                <td class="p-4 text-zinc-500">{{ formatDate(tx.created_at) }}</td>
                <td class="p-4">
                  <span class="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30 uppercase">
                    {{ tx.transaction_type }}
                  </span>
                </td>
                <td class="p-4 text-right font-semibold text-zinc-900 dark:text-white">
                  KES {{ Number(tx.amount).toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

// Types
interface Wallet {
  bank_details: any
  available_balance: number
  total_earned: number
}

interface Transaction {
  id: string
  description: string
  created_at: string
  transaction_type: string
  amount: number
}

// State
const bankDetails = ref<any>(null)
const wallet = ref<Wallet | null>(null)
const transactions = ref<Transaction[]>([])
const loading = ref(true)
const isSaving = ref(false)

const bankForm = ref({
  bank_name: '',
  account_holder_name: '',
  account_number: ''
})

// Methods
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

const getDashboardData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // 1. Fetch wallet & bank details
    const { data: walletData } = await supabase
      .from('seller_wallets')
      .select('bank_details, available_balance, total_earned')
      .eq('seller_id', user.id)
      .maybeSingle()
    
    if (walletData) {
      wallet.value = walletData
      if (walletData.bank_details) bankDetails.value = walletData.bank_details
    }

    // 2. Fetch recent transactions
    const { data: txData } = await supabase
      .from('seller_wallet_transactions')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })

    if (txData) transactions.value = txData
  }
  loading.value = false
}

const handleSaveBankDetails = async () => {
  isSaving.value = true
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    isSaving.value = false
    return
  }

  const updatedDetails = {
    bank_name: bankForm.value.bank_name,
    account_holder_name: bankForm.value.account_holder_name,
    account_number: bankForm.value.account_number,
  }

  const { error } = await supabase
    .from('seller_wallets')
    .upsert({ seller_id: user.id, bank_details: updatedDetails }, { onConflict: 'seller_id' })

  if (!error) {
    bankDetails.value = updatedDetails
    bankForm.value = { bank_name: '', account_holder_name: '', account_number: '' }
  }
  isSaving.value = false
}

// Lifecycle
onMounted(() => {
  getDashboardData()
})
</script>