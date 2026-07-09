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
}

.content {
  flex: 1;
  padding: 2rem;
  background-color: #f8fafc;
}
</style>