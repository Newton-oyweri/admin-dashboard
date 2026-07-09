<!-- src/layouts/DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <Navbar />           <!-- Reusable Navbar -->

    <main class="content">
      <router-view />    <!-- This renders DashboardHome, ProductsList, OrdersList -->
    </main>
  </div>
</template>

<script setup lang="ts">
import Navbar from '@/components/TopNavbar.vue'
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fcf8f8;
}

.content {
  flex: 1;
  background-color: #fcf8f8;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}
</style>