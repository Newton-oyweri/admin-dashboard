<script setup>
import { useRegisterSW } from 'virtual:pwa-register/vue'

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()

const close = () => {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div v-if="offlineReady || needRefresh" class="pwa-toast">
    <div class="message">
      <span v-if="offlineReady">🧁 App ready to work offline!</span>
      <span v-else>✨ New update available! Reload to update your app.</span>
    </div>
    <div class="buttons">
      <button v-if="needRefresh" @click="updateServiceWorker()" class="btn-refresh">Reload</button>
      <button @click="close()" class="btn-close">Close</button>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 16px;
  border: 1px solid #ffe0e6;
  border-radius: 8px;
  z-index: 9999;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
button {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.btn-refresh {
  background-color: #ff6b81;
  color: white;
}
.btn-close {
  background-color: #f3f4f6;
}
</style>