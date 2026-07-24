<template>
  <div class="border rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
    
    <!-- Header & Progress Bar -->
    <div class="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
      <div class="flex items-center justify-between mb-3">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400">
            Step {{ currentStep }} of 5
          </span>
          <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-50">
            {{ stepTitles[currentStep - 1] }}
          </h2>
        </div>
        <span class="text-xs text-zinc-400 font-medium">
          {{ Math.round((currentStep / 5) * 100) }}% Completed
        </span>
      </div>

      <div class="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
        <div 
          class="bg-pink-600 h-full transition-all duration-300 ease-out" 
          :style="{ width: `${(currentStep / 5) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Wizard Body -->
    <div class="p-5 min-h-[340px] flex flex-col justify-between">

      <!-- STEP 1: Product Categories -->
      <div v-if="currentStep === 1" class="space-y-4">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Select the main product type or department for this item:
        </p>

        <div v-if="loadingProductCategories" class="text-xs text-zinc-400 py-8 text-center">
          Loading departments...
        </div>

        <div v-else-if="productCategories.length === 0" class="text-center py-8 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
          <p class="text-xs text-zinc-400">No departments available.</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button
            type="button"
            v-for="pc in productCategories"
            :key="pc.id"
            @click="selectProductCategory(pc.id)"
            class="p-4 text-left rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-24"
            :class="selectedProductCategoryId === pc.id
              ? 'border-pink-600 bg-pink-50/50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-300 shadow-xs ring-2 ring-pink-500/20 font-semibold'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200'"
          >
            <span class="font-bold text-sm capitalize">{{ pc.name }}</span>
            <span class="text-[10px] text-zinc-400 truncate">{{ pc.subtitle || 'Department' }}</span>
          </button>
        </div>
      </div>

      <!-- STEP 2: Categories -->
      <div v-if="currentStep === 2" class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-xs text-zinc-500 dark:text-zinc-400">
            Choose a category under <strong class="text-zinc-800 dark:text-zinc-200 capitalize">{{ getSelectedProductCategoryName() }}</strong>:
          </p>
          <button
            type="button"
            @click="showCategoryModal = !showCategoryModal"
            class="text-xs text-pink-600 dark:text-pink-400 hover:underline font-semibold cursor-pointer"
          >
            {{ showCategoryModal ? '✕ Cancel' : '＋ Add New Category' }}
          </button>
        </div>

        <!-- Inline Category Creator -->
        <div v-if="showCategoryModal" class="p-4 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/40 space-y-3">
          <h4 class="text-xs font-bold text-pink-700 dark:text-pink-400">
            Create Category in {{ getSelectedProductCategoryName() }}
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-semibold text-zinc-500 mb-1">Category Name *</label>
              <input
                type="text"
                v-model="newCatForm.name"
                placeholder="e.g. Smartwatches"
                class="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-zinc-500 mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                v-model="newCatForm.subtitle"
                placeholder="e.g. Wearables"
                class="w-full text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
          <button
            type="button"
            @click="handleCreateCategory"
            :disabled="creatingCategory"
            class="w-full py-2 text-xs font-semibold rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ creatingCategory ? 'Saving Category...' : 'Save & Select Sub-Category' }}
          </button>
        </div>

        <!-- Category Grid -->
        <div v-if="loadingCategories" class="text-xs text-zinc-400 py-8 text-center">
          Loading categories...
        </div>
        <div v-else-if="filteredCategories.length === 0" class="text-center py-8 border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">
          <p class="text-xs text-zinc-400 mb-2">No categories found under this product category.</p>
          <button
            type="button"
            @click="showCategoryModal = true"
            class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 cursor-pointer"
          >
            ＋ Create Category
          </button>
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            type="button"
            v-for="cat in filteredCategories"
            :key="cat.id"
            @click="formData.category = cat.id"
            class="px-4 py-2 text-xs font-medium rounded-xl border capitalize transition-all cursor-pointer"
            :class="formData.category === cat.id
              ? 'bg-pink-600 border-pink-600 text-white shadow-xs font-semibold'
              : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-700 dark:text-zinc-300'"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- STEP 3: Product Details -->
      <div v-if="currentStep === 3" class="space-y-4">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Enter product details:
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-semibold uppercase text-zinc-500 mb-1">Product Name *</label>
            <input
              type="text"
              v-model="formData.name"
              placeholder="e.g. Leather Jacket..."
              class="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase text-zinc-500 mb-1">Price (KES) *</label>
            <input
              type="number"
              step="0.01"
              v-model="formData.price"
              placeholder="3500"
              class="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase text-zinc-500 mb-1">Type *</label>
            <select
              v-model="formData.post_type"
              class="w-full text-xs px-2.5 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
            >
              <option value="sale">Instant Purchase (Sale)</option>
              <option value="booking">Booking / Reservation</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-semibold uppercase text-zinc-500 mb-1">Description</label>
          <textarea
            v-model="formData.description"
            rows="3"
            placeholder="Item details, size, condition, warranty..."
            class="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50/50 dark:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500/20 resize-none"
          />
        </div>
      </div>

      <!-- STEP 4: Product Images -->
      <div v-if="currentStep === 4" class="space-y-4">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Upload item photos:
        </p>

        <div class="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 text-center bg-zinc-50/30 dark:bg-zinc-800/10 hover:border-pink-500 transition-colors">
          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleFileChange"
            class="block w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 dark:file:bg-pink-950/40 file:text-pink-700 dark:file:text-pink-300 cursor-pointer"
          />
        </div>

        <div v-if="previewUrls.length > 0" class="space-y-2">
          <label class="block text-[11px] font-semibold uppercase text-zinc-500">Selected Images ({{ previewUrls.length }})</label>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="(url, index) in previewUrls"
              :key="index"
              class="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 group"
            >
              <img :src="url" class="w-full h-full object-cover" />
              <button
                type="button"
                @click="removeFile(index)"
                class="absolute inset-0 bg-black/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- STEP 5: Confirm & Upload -->
      <div v-if="currentStep === 5" class="space-y-4">
        <p class="text-xs text-zinc-500 dark:text-zinc-400">
          Review details before publishing:
        </p>

        <div class="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-3">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-bold">Department</span>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 capitalize">{{ getSelectedProductCategoryName() }}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-bold">Category</span>
              <span class="font-medium text-zinc-800 dark:text-zinc-200 capitalize">{{ getSelectedCategoryName() }}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-bold">Product Name</span>
              <span class="font-medium text-zinc-800 dark:text-zinc-200">{{ formData.name }}</span>
            </div>
            <div>
              <span class="text-zinc-400 block text-[10px] uppercase font-bold">Price</span>
              <span class="font-bold text-pink-600 dark:text-pink-400">KES {{ Number(formData.price).toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="formData.description" class="pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs">
            <span class="text-zinc-400 block text-[10px] uppercase font-bold">Description</span>
            <p class="text-zinc-600 dark:text-zinc-300 line-clamp-2">{{ formData.description }}</p>
          </div>

          <div class="pt-2 border-t border-zinc-200 dark:border-zinc-700">
            <span class="text-zinc-400 block text-[10px] uppercase font-bold mb-1">Attached Images ({{ formData.files.length }})</span>
            <div class="flex gap-2">
              <img v-for="(url, idx) in previewUrls" :key="idx" :src="url" class="w-10 h-10 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700" />
            </div>
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-4">
        <button
          type="button"
          @click="prevStep"
          :disabled="currentStep === 1 || uploading"
          class="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        <button
          v-if="currentStep < 5"
          type="button"
          @click="nextStep"
          class="px-5 py-2 text-xs font-semibold rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:opacity-90 cursor-pointer"
        >
          Next →
        </button>

        <button
          v-else
          type="button"
          @click="handleUploadSubmit"
          :disabled="uploading || !userId"
          class="px-6 py-2 text-xs font-semibold rounded-xl bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {{ uploading ? 'Uploading & Publishing...' : 'Confirm & Publish' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

interface ProductCategory {
  id: string;
  name: string;
  subtitle?: string | null;
}

interface Category {
  id: string;
  name: string;
  subtitle?: string | null;
  product_category_id?: string | null;
}

interface FormData {
  name: string;
  category: string;
  price: string;
  description: string;
  post_type: 'sale' | 'booking';
  files: File[];
}

const props = defineProps<{
  userId: string | undefined;
}>()

const emit = defineEmits<{
  (e: 'productAdded', newProduct: any): void;
}>()

const currentStep = ref(1)
const stepTitles = [
  'Select Product Type',
  'Choose Category',
  'Product Details',
  'Upload Photos',
  'Confirm & Upload'
]

const productCategories = ref<ProductCategory[]>([])
const categories = ref<Category[]>([])
const selectedProductCategoryId = ref<string | null>(null)

const loadingProductCategories = ref(false)
const loadingCategories = ref(false)
const showCategoryModal = ref(false)
const creatingCategory = ref(false)
const uploading = ref(false)
const previewUrls = ref<string[]>([])

const formData = ref<FormData>({
  name: '',
  category: '',
  price: '',
  description: '',
  post_type: 'sale',
  files: []
})

const newCatForm = ref({
  name: '',
  subtitle: ''
})

const filteredCategories = computed(() => {
  if (!selectedProductCategoryId.value) return []
  return categories.value.filter(c => c.product_category_id === selectedProductCategoryId.value)
})

const selectProductCategory = (id: string) => {
  selectedProductCategoryId.value = id
  const matching = categories.value.filter(c => c.product_category_id === id)
  formData.value.category = matching.length > 0 ? matching[0].id : ''
}

const nextStep = () => {
  if (currentStep.value === 1 && !selectedProductCategoryId.value) return alert('Please select a product type.')
  if (currentStep.value === 2 && !formData.value.category) return alert('Please select a category.')
  if (currentStep.value === 3) {
    if (!formData.value.name.trim()) return alert('Please enter a product name.')
    if (!formData.value.price || parseFloat(formData.value.price) <= 0) return alert('Please enter a valid price.')
  }
  if (currentStep.value === 4 && formData.value.files.length === 0) return alert('Please attach at least one photo.')
  currentStep.value++
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const getSelectedProductCategoryName = () => {
  const found = productCategories.value.find(pc => pc.id === selectedProductCategoryId.value)
  return found ? found.name : 'Select Department'
}

const getSelectedCategoryName = () => {
  const found = categories.value.find(c => c.id === formData.value.category)
  return found ? found.name : 'Select Category'
}

const fetchProductCategories = async () => {
  loadingProductCategories.value = true
  try {
    const { data } = await supabase
      .from('product_categories')
      .select('id, name, subtitle')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (data && data.length > 0) {
      productCategories.value = data
      selectProductCategory(data[0].id)
    }
  } catch {
    // Fail silently in production
  } finally {
    loadingProductCategories.value = false
  }
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const { data } = await supabase
      .from('categories')
      .select('id, name, subtitle, product_category_id')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (data) categories.value = data
  } catch {
    // Fail silently in production
  } finally {
    loadingCategories.value = false
  }
}

const handleCreateCategory = async () => {
  if (!newCatForm.value.name.trim()) return alert('Category Name is required.')
  if (!selectedProductCategoryId.value) return alert('No product type selected.')

  creatingCategory.value = true
  try {
    const cleanName = newCatForm.value.name.trim()
    const slug = cleanName
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    if (!slug) throw new Error('Invalid category name format.')

    const { data, error } = await supabase
      .from('categories')
      .insert([
        {
          id: slug,
          name: cleanName,
          subtitle: newCatForm.value.subtitle.trim() || null,
          product_category_id: selectedProductCategoryId.value,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) throw error

    await fetchCategories()
    if (data?.id) formData.value.category = data.id

    newCatForm.value = { name: '', subtitle: '' }
    showCategoryModal.value = false
  } catch (err: any) {
    alert('Could not create category: ' + (err.message || 'Duplicate category or permission issue.'))
  } finally {
    creatingCategory.value = false
  }
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])

  if (selectedFiles.length > 0) {
    formData.value.files = [...formData.value.files, ...selectedFiles]
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file))
    previewUrls.value = [...previewUrls.value, ...newPreviews]
  }

  target.value = ''
}

const removeFile = (index: number) => {
  formData.value.files.splice(index, 1)
  URL.revokeObjectURL(previewUrls.value[index])
  previewUrls.value.splice(index, 1)
}

const handleUploadSubmit = async () => {
  if (!props.userId) return alert('Session user missing!')
  if (formData.value.files.length === 0) return alert('Please attach at least one photo.')

  uploading.value = true
  const uploadedUrls: string[] = []

  try {
    for (let i = 0; i < formData.value.files.length; i++) {
      const file = formData.value.files[i]
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const cloudflareRes = await fetch('https://posts-api.unscriptedusa.workers.dev/', {
        method: 'POST',
        body: uploadFormData
      })

      if (!cloudflareRes.ok) {
        throw new Error(`Failed to upload photo ${i + 1} (${file.name})`)
      }

      const resData = await cloudflareRes.json()
      if (!resData.image_url) {
        throw new Error(`Invalid response for photo ${i + 1}`)
      }

      uploadedUrls.push(resData.image_url)
    }

    const productPayload = {
      seller_id: props.userId,
      category: formData.value.category,
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || null,
      price: parseFloat(formData.value.price),
      image_urls: uploadedUrls,
      is_available: true,
      post_type: formData.value.post_type
    }

    const { data, error } = await supabase
      .from('products')
      .insert([productPayload])
      .select()
      .single()

    if (error) throw error

    emit('productAdded', data)

    formData.value = { name: '', category: '', price: '', description: '', post_type: 'sale', files: [] }
    previewUrls.value.forEach(url => URL.revokeObjectURL(url))
    previewUrls.value = []
    currentStep.value = 1

    alert('✅ Product published successfully!')
  } catch (err: any) {
    alert('❌ Error publishing product: ' + err.message)
  } finally {
    uploading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchProductCategories(), fetchCategories()])
})
</script>

