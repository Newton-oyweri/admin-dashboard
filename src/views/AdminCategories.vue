<template>
  <div class="border rounded-xl p-4 bg-white dark:bg-zinc-900 space-y-4">
    <h3 class="font-bold text-sm">Manage Categories</h3>
    
    <!-- Add New Category -->
    <form @submit.prevent="handleCreateCategory" class="space-y-3 text-xs border-b pb-6">
      <div>
        <label class="block font-semibold mb-1 text-zinc-400 uppercase">Category Name (Slug ID)</label>
        <input 
          type="text" 
          v-model="catForm.name" 
          placeholder="Pizza, Cake, Sharma Specials" 
          required 
          class="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-pink-500" 
          @input="updateSlug"
        />
        <p v-if="catForm.id" class="text-[10px] text-zinc-500 mt-1 font-mono">Slug: {{ catForm.id }}</p>
      </div>
      
      <div>
        <label class="block font-semibold mb-1 text-zinc-400 uppercase">Subtitle Description</label>
        <input 
          type="text" 
          v-model="catForm.subtitle" 
          placeholder="Freshly prepared deals" 
          class="w-full p-2 border rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-pink-500" 
        />
      </div>
      
      <div>
        <label class="block font-semibold mb-1 text-zinc-400 uppercase">Category Image Banner</label>
        <input 
          type="file" 
          accept="image/*" 
          @change="handleCatFileChange" 
          id="catFileInput" 
          class="w-full text-xs text-zinc-500 cursor-pointer" 
        />
        <div v-if="imagePreview" class="mt-2">
          <img :src="imagePreview" alt="Preview" class="w-20 h-20 object-cover rounded-lg border" />
          <p class="text-[10px] text-zinc-400">Selected image preview</p>
        </div>
      </div>

      <button 
        type="submit" 
        :disabled="saving || !isFormValid" 
        class="w-full py-2 bg-pink-600 text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50"
      >
        {{ saving ? 'Uploading & Syncing...' : 'Sync New Category' }}
      </button>
    </form>

    <!-- Categories List -->
    <div>
      <h4 class="font-bold text-sm mb-3 px-1">Application Categories Registry</h4>
      <div class="border rounded-xl bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden text-xs">
        <div v-for="cat in categories" :key="cat.id" class="p-3 flex items-center justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <img 
              v-if="cat.image_url" 
              :src="cat.image_url" 
              alt="" 
              class="w-10 h-10 object-cover rounded-lg border bg-zinc-100 flex-shrink-0" 
            />
            <div v-else class="w-10 h-10 rounded-lg border bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 flex-shrink-0">No Img</div>
            
            <div class="min-w-0 flex-1">
              <p class="font-bold truncate">{{ cat.name }} <code class="text-[9px] text-zinc-400 font-normal">({{ cat.id }})</code></p>
              <p class="text-[10px] text-zinc-500 truncate">{{ cat.subtitle || 'No context text declared' }}</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="toggleCategoryState(cat)"
              class="px-3 py-1 rounded text-[10px] font-bold"
              :class="cat.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'"
            >
              {{ cat.is_active ? 'Active' : 'Disabled' }}
            </button>
            
            <button
              @click="deleteCategory(cat)"
              class="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400 rounded text-[10px] font-bold transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { PropType } from 'vue'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string;
  name: string;
  subtitle: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order?: number;
}

const props = defineProps({
  categories: {
    type: Array as PropType<Category[]>,
    required: true
  }
})

const emit = defineEmits<{
  (e: 'update:categories'): void
}>()

const catForm = ref({ id: '', name: '', subtitle: '' })
const selectedFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const saving = ref(false)

const updateSlug = () => {
  const name = catForm.value.name.trim().toLowerCase()
  catForm.value.id = name.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

const handleCatFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(target.files[0])
  }
}

const isFormValid = computed(() => {
  return catForm.value.name.trim() !== '' && catForm.value.subtitle.trim() !== ''
})

const handleCreateCategory = async () => {
  if (!isFormValid.value) {
    alert('Please fill all required fields')
    return
  }

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

    const { error } = await supabase.from('categories').insert([{
      id: catForm.value.id || catForm.value.name.toLowerCase().replace(/\s+/g, '-'),
      name: catForm.value.name.trim(),
      subtitle: catForm.value.subtitle.trim() || null,
      image_url: uploadedImageUrl,
      display_order: props.categories.length 
    }])

    if (!error) {
      // Reset form
      catForm.value = { id: '', name: '', subtitle: '' }
      selectedFile.value = null
      imagePreview.value = null
      const fileInput = document.getElementById('catFileInput') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      emit('update:categories')
    } else {
      alert(`Could not insert category: ${error.message}`)
    }
  } catch (err) {
    alert(`❌ Operation failed: ${(err as Error).message}`)
  } finally {
    saving.value = false
  }
}

const toggleCategoryState = async (cat: Category) => {
  const targetState = !cat.is_active
  const { error } = await supabase.from('categories').update({ is_active: targetState }).eq('id', cat.id)
  if (!error) {
    cat.is_active = targetState
  } else {
    alert('Failed to update category state')
  }
}

const deleteCategory = async (cat: Category) => {
  if (!confirm(`Delete category "${cat.name}"? This action cannot be undone.`)) return
  
  const { error } = await supabase.from('categories').delete().eq('id', cat.id)
  if (!error) {
    emit('update:categories')
  } else {
    alert(`Failed to delete: ${error.message}`)
  }
}
</script>