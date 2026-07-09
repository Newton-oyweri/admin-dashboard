<!-- src/views/LoginPage.vue -->
<template>
  <div style="padding: 40px; font-family: sans-serif;">
    <h1>WonderBakes Seller</h1>
    
    <form @submit.prevent="handleLogin">
      <input
        type="email"
        placeholder="Email"
        v-model="email"
        :disabled="loading"
        :style="inputStyle"
        required
      />
      <br /><br />
      <input
        type="password"
        placeholder="Password"
        v-model="password"
        :disabled="loading"
        :style="inputStyle"
        required
      />
      <br /><br />
      <button 
        type="submit" 
        :disabled="loading" 
        :style="buttonStyle"
      >
        {{ loading ? "Logging in..." : "Login" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

// Styles
const inputStyle = {
  width: '100%',
  maxWidth: '320px',
  padding: '10px 14px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
  outline: 'none',
  boxSizing: 'border-box' as const,
  backgroundColor: loading.value ? '#f5f5f5' : '#fff',
}

const buttonStyle = {
  width: '100%',
  maxWidth: '320px',
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  backgroundColor: loading.value ? '#482121' : '#f97316',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  cursor: loading.value ? 'not-allowed' : 'pointer',
}

// Handle login
const handleLogin = async () => {
  if (loading.value) return

  loading.value = true
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    alert(error.message)
    loading.value = false
    return
  }

  // Redirect will be handled by auth listener in router
  router.push('/')
}
</script>