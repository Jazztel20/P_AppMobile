<script setup lang="ts">
import Header from './components/partials/Header.vue'
import Footer from './components/partials/Footer.vue'
</script>

<template>
  <Header />
  <main class="main-content">
    <router-view />
  </main>
  <Footer />
</template>

<style>
/* Ensure the app stretches full height and footer sticks to bottom */
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}
</style>
