<template>
  <div class="w-full max-w-7xl mx-auto p-4 space-y-8 text-zinc-900 dark:text-zinc-50">
    
    <div class="flex flex-wrap justify-between items-center gap-4 border-b pb-4 border-zinc-200 dark:border-zinc-800">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Admin Control Center</h1>
        <p class="text-xs text-zinc-500">Manage categories, view global ledger assets, and process seller payouts.</p>
      </div>
      <div v-if="platformWallet" class="flex gap-4 text-xs font-mono bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl">
        <div>Platform Revenue: <span class="font-bold text-emerald-600">KES {{ Number(platformWallet.total_revenue).toLocaleString() }}</span></div>
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
            <p class="text-[10px] text-zinc-400 font-mono">{{ seller.seller_id }}</p>
            <p class="text-[10px] text-zinc-500 mt-1">Total Earned Life-to-date: KES {{ Number(seller.total_earned).toLocaleString() }}</p>
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
      <div class="border rounded-xl p-4 bg-white dark:bg-zinc-900 space-y-4">
        <h3 class="font-bold text-sm">Add New Category Parameter</h3>
        <form @submit.prevent="handleCreateCategory" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1 text-zinc-400 uppercase">Slug ID</label>
            <input type="text" v-model="catForm.id" placeholder="pizza, cake, sharma" required class="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-pink-500 lowercase" @input="catForm.id = catForm.id.toLowerCase().replace(/\s+/g, '-')" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-zinc-400 uppercase">Display Name</label>
            <input type="text" v-model="catForm.name" placeholder="Pizza, Cake, Sharma Specials" required class="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-pink-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-zinc-400 uppercase">Subtitle Description</label>
            <input type="text" v-model="catForm.subtitle" placeholder="Freshly prepared deals" class="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-pink-500" />
          </div>
          <div>
            <label class="block font-semibold mb-1 text-zinc-400 uppercase">Category Image Banner</label>
            <input type="file" accept="image/*" @change="handleCatFileChange" id="catFileInput" class="w-full text-xs text-zinc-500 cursor-pointer" />
          </div>
          <button type="submit" :disabled="saving" class="w-full py-2 bg-pink-600 text-white font-semibold rounded-lg cursor-pointer">
            {{ saving ? 'Uploading & Syncing...' : 'Sync New Category' }}
          </button>
        </form>
      </div>

      <div class="lg:col-span-2 space-y-2">
        <h3 class="font-bold text-sm px-1">Application Categories Array Registry</h3>
        <div class="border rounded-xl bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden text-xs">
          <div v-for="cat in categories" :key="cat.id" class="p-3 flex items-center justify-between gap-2">
            <div class="flex items-center gap-3 min-w-0">
              <img v-if="cat.image_url" :src="cat.image_url" alt="" class="w-10 h-10 object-cover rounded-lg border bg-zinc-100" />
              <div v-else class="w-10 h-10 rounded-lg border bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400">No Img</div>
              <div class="min-w-0">
                <p class="font-bold truncate">{{ cat.name }} <code class="text-[9px] text-zinc-400 font-normal">({{ cat.id }})</code></p>
                <p class="text-[10px] text-zinc-500 truncate max-w-xs">{{ cat.subtitle || 'No context text declared' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <div class="flex items-center gap-1 font-mono">
                <button @click="changeCategoryPriority(cat, -1)" class="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">▼</button>
                <span class="font-bold">{{ cat.display_order }}</span>
                <button @click="changeCategoryPriority(cat, 1)" class="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">▲</button>
              </div>
              <button
                @click="toggleCategoryState(cat)"
                class="px-2 py-1 rounded text-[10px] font-bold"
                :class="cat.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'"
              >
                {{ cat.is_active ? 'Active' : 'Disabled' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

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
  total_payouts: number;
}

const sellers = ref<SellerWallet[]>([])
const categories = ref<Category[]>([])
const platformWallet = ref<PlatformWallet | null>(null)

const loading = ref(false)
const saving = ref(false)
const paying = ref(false)

const catForm = ref({ id: '', name: '', subtitle: '' })
const selectedFile = ref<File | null>(null)

const fetchAdminLedgerData = async () => {
  loading.value = true
  const { data: pfData } = await supabase.from('platform_wallet').select('total_revenue, total_payouts').limit(1).maybeSingle()
  if (pfData) platformWallet.value = pfData

  const { data: catData } = await supabase.from('categories').select('*').order('display_order', { ascending: true })
  if (catData) categories.value = catData

  const { data: sellData } = await supabase
    .from('seller_wallets')
    .select('id, seller_id, available_balance, total_earned, profiles(full_name, phone)')
    .order('available_balance', { ascending: false })
  
  if (sellData) sellers.value = sellData as unknown as SellerWallet[]
  loading.value = false
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

const handleCatFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleCreateCategory = async () => {
  saving.value = true
  let uploadedImageUrl: string | null = null

  try {
    if (selectedFile.value) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile.value)

      const cloudflareRes = await fetch('https://posts-api.unscriptedusa.workers.dev/', {
        method: 'POST',
        body: uploadFormData
      })

      if (!cloudflareRes.ok) throw new Error('Cloudflare R2 storage upload failure.')
      const json = await cloudflareRes.json()
      uploadedImageUrl = json.image_url
    }

    const nextOrderIdx = categories.value.length ? Math.max(...categories.value.map(c => c.display_order)) + 1 : 0
    
    const { error } = await supabase.from('categories').insert([{
      id: catForm.value.id.trim(),
      name: catForm.value.name.trim(),
      subtitle: catForm.value.subtitle.trim() || null,
      image_url: uploadedImageUrl,
      display_order: nextOrderIdx
    }])

    if (!error) {
      catForm.value = { id: '', name: '', subtitle: '' }
      selectedFile.value = null
      const fileInput = document.getElementById('catFileInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      await fetchAdminLedgerData()
    } else {
      alert(`Could not insert category: ${error.message}`)
    }
  } catch (err) {
    alert(`❌ Media upload failed: ${(err as Error).message}`)
  } finally {
    saving.value = false
  }
}

const toggleCategoryState = async (cat: Category) => {
  const targetState = !cat.is_active
  const { error } = await supabase.from('categories').update({ is_active: targetState }).eq('id', cat.id)
  if (!error) cat.is_active = targetState
}

const changeCategoryPriority = async (cat: Category, change: number) => {
  const nextWeight = cat.display_order + change
  const { error } = await supabase.from('categories').update({ display_order: nextWeight }).eq('id', cat.id)
  if (!error) {
    cat.display_order = nextWeight
    categories.value.sort((a, b) => a.display_order - b.display_order)
  }
}

onMounted(() => {
  fetchAdminLedgerData()
})
</script>