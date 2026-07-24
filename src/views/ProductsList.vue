<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-4 space-y-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
          Catalog Management
        </h1>
        <p class="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Manage your digital catalog and track real-time listings.
        </p>
      </div>
      <div class="self-start sm:self-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-xs font-medium">
        Total Items: <span class="font-bold text-pink-600 dark:text-pink-400">{{ totalProducts }}</span>
      </div>
    </div>

    <div class="space-y-6">

      <!-- AddProduct Component -->
      <AddProduct :user-id="user?.id" @product-added="handleProductAdded" />

      <!-- Catalog List -->
      <div class="space-y-4">
        <div class="flex items-center justify-between px-1">
          <h2 class="text-base font-bold tracking-tight">All Products</h2>
          <span v-if="totalProducts > 0" class="text-xs text-zinc-400">
            Showing {{ ((currentPage - 1) * PAGE_SIZE) + 1 }} - {{ Math.min(currentPage * PAGE_SIZE, totalProducts) }} of {{ totalProducts }}
          </span>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="inline-block h-6 w-6 animate-spin rounded-full border-2 border-pink-500 border-t-transparent"></div>
          <p class="mt-2 text-xs text-zinc-400">Loading products...</p>
        </div>

        <div v-else-if="products.length === 0" class="text-center py-16 border rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p class="text-sm text-zinc-400">No products added yet.</p>
        </div>

        <div v-else class="border rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div class="hidden sm:grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <div class="col-span-5">Product</div>
            <div class="col-span-2 text-center">Price</div>
            <div class="col-span-2 text-center">Stock Status</div>
            <div class="col-span-3 text-right">Actions</div>
          </div>

          <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
            <div
              v-for="product in products"
              :key="product.id"
              class="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
              :class="{ 'opacity-60': !product.is_available }"
            >
              <!-- Mobile view -->
              <div class="sm:hidden space-y-3">
                <div class="flex items-start gap-3">
                  <div class="relative shrink-0">
                    <img
                      v-if="product.image_urls && product.image_urls.length > 0"
                      :src="product.image_urls[0]"
                      :alt="product.name"
                      class="w-16 h-16 object-cover rounded-lg border border-zinc-100 dark:border-zinc-800"
                    />
                    <div v-else class="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-[10px] text-zinc-400">
                      No Image
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                        {{ product.category }}
                      </span>
                      <span class="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 capitalize">
                        {{ product.post_type === 'sale' ? 'For delivery' : 'For Booking' }}
                      </span>
                    </div>
                    <h3 class="font-semibold text-sm text-zinc-900 dark:text-zinc-50 truncate">
                      {{ product.name }}
                    </h3>
                    <p class="text-sm font-bold text-pink-600 dark:text-pink-400">
                      KES {{ Number(product.price).toLocaleString() }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    @click="handleToggleStock(product.id, product.is_available)"
                    class="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    {{ product.is_available ? 'Mark Out of Stock' : 'Mark In Stock' }}
                  </button>
                  <button
                    @click="handleDelete(product.id, product.image_urls)"
                    class="text-xs font-medium text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <!-- Desktop view -->
              <div class="hidden sm:grid grid-cols-12 gap-2 items-center">
                <div class="col-span-5 flex items-center gap-3 min-w-0">
                  <div class="relative shrink-0">
                    <img
                      v-if="product.image_urls && product.image_urls.length > 0"
                      :src="product.image_urls[0]"
                      :alt="product.name"
                      class="w-10 h-10 object-cover rounded-lg border border-zinc-100 dark:border-zinc-800"
                    />
                    <div v-else class="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-[8px] text-zinc-400">
                      No Image
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-[10px] font-semibold uppercase text-zinc-400 dark:text-zinc-500">
                        {{ product.category }}
                      </span>
                      <span class="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600 dark:text-zinc-300 capitalize">
                        {{ product.post_type === 'sale' ? 'For delivery' : 'For booking' }}
                      </span>
                    </div>
                    <p class="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-50 truncate">
                      {{ product.name }}
                    </p>
                  </div>
                </div>

                <div class="col-span-2 text-center">
                  <span class="text-xs sm:text-sm font-bold text-pink-600 dark:text-pink-400">
                    KES {{ Number(product.price).toLocaleString() }}
                  </span>
                </div>

                <div class="col-span-2 text-center">
                  <span class="text-[10px] sm:text-xs font-semibold px-2 py-1 rounded" :class="product.is_available ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'">
                    {{ product.is_available ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </div>

                <div class="col-span-3 flex items-center justify-end gap-2">
                  <button
                    @click="handleToggleStock(product.id, product.is_available)"
                    class="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    {{ product.is_available ? 'Mark Out of Stock' : 'Mark In Stock' }}
                  </button>
                  <button
                    @click="handleDelete(product.id, product.image_urls)"
                    class="text-xs font-medium text-zinc-400 hover:text-red-500 dark:hover:text-red-400 px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination Bar -->
          <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1 || loading"
              class="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-semibold disabled:opacity-40 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span class="text-zinc-500 dark:text-zinc-400 font-medium">
              Page <strong class="text-zinc-900 dark:text-zinc-100">{{ currentPage }}</strong> of <strong>{{ totalPages }}</strong>
            </span>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages || loading"
              class="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 font-semibold disabled:opacity-40 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AddProduct from './Addproduct.vue'

interface Product {
  id: string;
  seller_id: string;
  category: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  post_type: 'sale' | 'booking';
  image_urls: string[] | null;
}

const PAGE_SIZE = 10

// State
const products = ref<Product[]>([])
const totalProducts = ref(0)
const currentPage = ref(1)
const loading = ref(false)
const user = ref<{ id: string; email?: string; name: string } | null>(null)

const totalPages = computed(() => Math.ceil(totalProducts.value / PAGE_SIZE))

// Methods
const getSessionUser = async () => {
  const { data: { user: sessionUser } } = await supabase.auth.getUser()
  if (!sessionUser) return null

  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0] || 'Seller'
  }
}

const fetchProductsPage = async (page: number) => {
  loading.value = true
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  try {
    const { data, count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    products.value = (data as Product[]) || []
    totalProducts.value = count || 0
    currentPage.value = page
  } catch {
    // Silent fail for production
  } finally {
    loading.value = false
  }
}

const changePage = (newPage: number) => {
  if (newPage < 1 || newPage > totalPages.value) return
  fetchProductsPage(newPage)
}

const updateProductAvailability = async (id: string, nextStatus: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .update({ is_available: nextStatus })
    .eq('id', id)

  return !error
}

const removeProduct = async (id: string, imageUrls: string[] | null): Promise<boolean> => {
  if (imageUrls) {
    for (const url of imageUrls) {
      const key = url.split('.r2.dev/')[1]
      if (key) {
        await fetch(`https://posts-api.unscriptedusa.workers.dev/?key=${key}`, {
          method: 'DELETE'
        }).catch(() => {})
      }
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  return !error
}

const handleProductAdded = () => {
  // Jump back to page 1 to display newest item
  fetchProductsPage(1)
}

const handleToggleStock = async (id: string, currentStatus: boolean) => {
  const newStatus = !currentStatus
  const action = newStatus ? 'in stock' : 'out of stock'
  const success = await updateProductAvailability(id, newStatus)
  if (success) {
    products.value = products.value.map(p => p.id === id ? { ...p, is_available: newStatus } : p)
    alert(`✅ Product marked as ${action}`)
  } else {
    alert('❌ Failed to update stock status')
  }
}

const handleDelete = async (id: string, imageUrls: string[] | null) => {
  if (!confirm('Are you sure you want to delete this listing permanently?')) return
  const success = await removeProduct(id, imageUrls)
  if (success) {
    // If last item on page deleted, go back 1 page if available
    const targetPage = (products.value.length === 1 && currentPage.value > 1) 
      ? currentPage.value - 1 
      : currentPage.value
      
    await fetchProductsPage(targetPage)
    alert('✅ Listing deleted successfully!')
  } else {
    alert('❌ Failed to delete product')
  }
}

// Lifecycle
onMounted(async () => {
  const activeUser = await getSessionUser()
  if (activeUser) {
    user.value = activeUser
  } else {
    alert('Please log in first!')
    return
  }

  await fetchProductsPage(1)
})
</script>

