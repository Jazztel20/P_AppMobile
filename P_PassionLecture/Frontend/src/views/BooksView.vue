<!-- Page Recherche – affiche les résultats d'une recherche par titre -->

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BookCard from '@/components/bookcard/BookCard.vue'
import { searchBooks, type Book } from '@/api/books'

const route  = useRoute()
const router = useRouter()

const query   = ref((route.query.q as string) ?? '')
const books   = ref<Book[]>([])
const loading = ref(false)

async function doSearch(q: string) {
  loading.value = true
  books.value   = await searchBooks(q)
  loading.value = false
}

onMounted(() => doSearch(query.value))

watch(() => route.query.q, (q) => {
  query.value = (q as string) ?? ''
  doSearch(query.value)
})

function handleSearch() {
  router.push({ name: 'search', query: { q: query.value } })
}
</script>

<template>
  <div class="page-body">
    <div class="search-bar">
      <input
        v-model="query"
        type="text"
        placeholder="Rechercher un livre par titre…"
        @keyup.enter="handleSearch"
        id="search-input"
      />
      <button @click="handleSearch" id="search-btn">🔍</button>
    </div>

    <div v-if="loading" class="status">Recherche en cours…</div>
    <div v-else-if="books.length === 0" class="status">Aucun résultat pour « {{ query }} »</div>

    <div v-else class="book-grid">
      <BookCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        :showActions="false"
      />
    </div>
  </div>
</template>

<style scoped>
.page-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.search-bar {
  display: flex;
  gap: .6rem;
  margin-bottom: 2rem;
}
.search-bar input {
  flex: 1;
  padding: .65rem 1rem;
  border: 1.5px solid #9ccfff;
  border-radius: 99px;
  font-size: 1rem;
  background: #f0f8ff;
  outline: none;
  transition: border-color .2s;
}
.search-bar input:focus { border-color: #0172c5; }
.search-bar button {
  background: #0172c5;
  color: #fff;
  border: none;
  border-radius: 99px;
  padding: .65rem 1.3rem;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity .2s;
}
.search-bar button:hover { opacity: .85; }

.status {
  text-align: center;
  color: #888;
  padding: 3rem;
  font-size: 1rem;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
  justify-items: center;
}
</style>
