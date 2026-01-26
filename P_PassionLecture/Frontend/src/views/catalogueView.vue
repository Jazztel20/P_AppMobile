<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BookCard from '@/components/bookcard/BookCard.vue'
import { getBooks } from '@/api/books'
import type { Book } from '@/api/books'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const books = ref<Book[]>([])

onMounted(async () => {
  books.value = await getBooks()
})

const myBooks = computed(() => {
  const userId = auth.user?.id
  if (!userId) return []
  return books.value.filter((b) => (b as any).user?.id === userId)
})
</script>

<template>
  <div class="page-body">
    <div class="top-bar">
      <h1>Votre catalogue</h1>

      <router-link v-if="auth.user" :to="{ name: 'addbook' }" class="add-btn">
        ➕ Ajouter un ouvrage
      </router-link>
    </div>

    <p v-if="!auth.user">Vous devez être connecté pour voir votre catalogue.</p>

    <div v-else class="catalogue-grid">
      <BookCard v-for="book in myBooks" :key="book.id" :book="book" :showActions="true" />
    </div>
  </div>
</template>

<style scoped>
.page-body {
  padding: 40px;
  min-height: 100vh;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.top-bar h1 {
  font-size: 28px;
  font-weight: bold;
}

.add-btn {
  background: #22c55e;
  padding: 10px 18px;
  border-radius: 20px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: 0.2s;
}

.add-btn:hover {
  background: #16a34a;
}

.catalogue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 40px;
  justify-items: center;
}
</style>
