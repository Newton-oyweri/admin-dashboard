<template>
  <div class="w-full max-w-7xl mx-auto px-4 py-4 space-y-6 sm:py-8 sm:space-y-8 text-zinc-900 dark:text-zinc-50">
  
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
        Total Items: <span class="font-bold text-pink-600 dark:text-pink-400">{{ products.length }}</span>
      </div>
    </div>

    <div class="space-y-6">
      
      <div class="border rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div class="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800">
          <h2 class="text-base font-bold tracking-tight">Add New Product</h2>
        </div>
        
        <form @submit.prevent="handleUploadSubmit" class="p-4 sm:p-5 space-y-4">
          
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
              Select Category
            </label>
            <div v-if="categories.length === 0" class="text-xs text-zinc-400 py-2">
              Loading active categories...
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                type="button"
                v-for="cat in categories"
                :key="cat.id"
                @click="formData.category = cat.id"
                class="px-4 py-2 text-xs font-semibold rounded-xl border capitalize transition-all cursor-pointer"
                :class="formData.category === cat.id 
                  ? 'bg-pink-600 border-pink-600 text-white shadow-xs' 
                  : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'"
              >
                {{ cat.name }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Product Name
              </label>
              <input 
                type="text" 
                v-model="formData.name"
                placeholder="Chocolate Fudge, Rose Bouquet..."
                required
                class="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Price (KES)
              </label>
              <input 
                type="number" 
                v-model="formData.price"
                placeholder="2500"
                required
                class="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Product Type
              </label>
              <select 
                v-model="formData.post_type"
                class="w-full text-sm px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
              >
                <option value="sale">Instant Purchase</option>
                <option value="booking">Booking</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Description
            </label>
            <textarea 
              v-model="formData.description"
              rows="3"
              placeholder="Provide product details such as ingredients/materials used, cake flavour, pizza size, flower type, dimensions..."
              class="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 resize-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
              Product Images
            </label>
            <div class="border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center bg-zinc-50/30 dark:bg-zinc-800/10 hover:border-pink-500 transition-colors">
              <input 
                id="fileInput"
                type="file" 
                multiple 
                accept="image/*" 
                @change="handleFileChange"
                required
                class="block w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-pink-50 dark:file:bg-pink-950/30 file:text-pink-700 dark:file:text-pink-400 cursor-pointer"
              />
              <p v-if="formData.files.length > 0" class="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {{ formData.files.length }} images selected
              </p>
            </div>
          </div>

          <button 
            type="submit"
            :disabled="uploading || !user"
            class="w-full py-2.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-semibold rounded-xl text-sm transition-transform active:scale-98 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed shadow-xs"
          >
            {{ uploading ? 'Adding Product...' : 'Add Product' }}
          </button>
        </form>
      </div>

      <div class="space-y-4">
        <h2 class="text-base font-bold tracking-tight px-1">All Products</h2>

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
                    class="text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

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
  post_type: 'sale' | 'booking' | 'pinned';
  image_urls: string[] | null;
}

interface Category {
  id: string;
  name: string;
  is_active: boolean;
  display_order: number;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  description: string;
  post_type: 'sale' | 'booking';
  files: File[];
}

// State
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const uploading = ref(false)
const user = ref<{ id: string; email?: string; name: string } | null>(null)

const formData = ref<FormData>({
  name: '',
  category: '', // Set on load dynamically
  price: '',
  description: '',
  post_type: 'sale',
  files: []
})

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

const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, is_active, display_order')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error loading categories:', error)
    return []
  }
  return data as Category[]
}

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  return data as Product[]
}

const uploadProduct = async (formDataValue: FormData, userId: string): Promise<Product | null> => {
  const uploadedUrls: string[] = []
  
  for (const file of formDataValue.files) {
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    const cloudflareRes = await fetch('https://posts-api.unscriptedusa.workers.dev/', {
      method: 'POST',
      body: uploadFormData
    })

    if (!cloudflareRes.ok) throw new Error(`Failed to upload ${file.name}`)

    const { image_url } = await cloudflareRes.json()
    uploadedUrls.push(image_url)
  }

  const productData = {
    seller_id: userId,
    category: formDataValue.category,
    name: formDataValue.name,
    description: formDataValue.description,
    price: parseFloat(formDataValue.price),
    image_urls: uploadedUrls,
    is_available: true,
    post_type: formDataValue.post_type
  }

  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()

  if (error) throw new Error(error.message)
  return data && data.length > 0 ? (data[0] as Product) : null
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
        })
      }
    }
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  return !error
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    formData.value.files = files
  }
}

const handleUploadSubmit = async () => {
  if (!user.value) return alert('Session not found. Please re-authenticate.')
  if (!formData.value.category) return alert('Please select a category first!')
  if (formData.value.files.length === 0) return alert('Please select at least one image')

  uploading.value = true
  try {
    const newProduct = await uploadProduct(formData.value, user.value.id)
    if (newProduct) {
      products.value = [newProduct, ...products.value]
      // Clear but persist the first category choice
      const savedCategory = formData.value.category
      formData.value = { name: '', category: savedCategory, price: '', description: '', post_type: 'sale', files: [] }
      const fileInput = document.getElementById('fileInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      alert('✅ Product added successfully!')
    }
  } catch (error) {
    alert('❌ Failed to add product: ' + (error as Error).message)
  } finally {
    uploading.value = false
  }
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
    products.value = products.value.filter(p => p.id !== id)
    alert('✅ Listing deleted successfully!')
  } else {
    alert('❌ Failed to delete product')
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  
  const activeUser = await getSessionUser()
  if (activeUser) {
    user.value = activeUser
  } else {
    alert('Please log in first!')
    loading.value = false
    return
  }
  
  // Load Categories first to sync with initial formData selection
  const categoryList = await fetchCategories()
  categories.value = categoryList
  const firstCategory = categoryList[0]
  if (firstCategory) {
    formData.value.category = firstCategory.id
  }
  
  const productList = await fetchProducts()
  products.value = productList
  loading.value = false
})
</script>