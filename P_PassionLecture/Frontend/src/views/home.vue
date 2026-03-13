<script setup lang="ts">
// ─── Imports ───────────────────────────────────────────────────────────────────
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '@/components/bookcard/BookCard.vue'
import { homePageAPI, type Book } from '@/api/books'
import { getCategories as fetchCategories } from '@/api/categories'

const router = useRouter()

// ─── State ────────────────────────────────────────────────────────────────────
const books       = ref<Book[]>([])
const categories  = ref<{ id: number; label: string }[]>([])
const searchQuery = ref('')
const loading     = ref(true)

// ─── Load ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [bookData, catData] = await Promise.all([homePageAPI(), fetchCategories()])
  books.value      = bookData
  categories.value = catData
  loading.value    = false
})

// ─── Search ───────────────────────────────────────────────────────────────────
function handleSearch() {
  const q = searchQuery.value.trim()
  if (!q) return
  router.push({ name: 'search', query: { q } })
}

function goToCategory(id: number) {
  router.push({ name: 'categories' })
}
</script>

<template>
  <div class="page-body">
    <div class="page-wrapper">

      <!-- ── Intro ────────────────────────────────────────────────────────── -->
      <section class="intro">
        <p>
          Bienvenue sur <strong>Passion Lecture</strong>, l'espace dédié à tous ceux qui aiment
          découvrir, partager et échanger autour des livres. Que vous soyez passionné de romans,
          amateur de mangas ou curieux de nouvelles lectures, vous trouverez ici une plateforme
          ouverte où chacun peut présenter ses ouvrages, laisser une appréciation ou consulter
          les avis de la communauté. Plongez dans l'univers des lecteurs !
        </p>
      </section>

      <!-- ── Search bar ───────────────────────────────────────────────────── -->
      <div class="search-row">
        <div class="search-box">
          <input
            v-model="searchQuery"
            id="home-search-input"
            type="text"
            placeholder="Rechercher un livre…"
            @keyup.enter="handleSearch"
          />
          <button id="home-search-btn" @click="handleSearch">🔍</button>
        </div>

        <!-- Category quick-filter chips -->
        <div class="cat-chips">
          <button
            v-for="cat in categories.slice(0, 6)"
            :key="cat.id"
            class="cat-chip"
            @click="goToCategory(cat.id)"
          >{{ cat.label }}</button>
        </div>
      </div>

      <!-- ── Featured books ───────────────────────────────────────────────── -->
      <section class="books-section">
        <h2 class="section-title">Dernières parutions</h2>

        <div v-if="loading" class="status">Chargement…</div>

        <div v-else class="book-cards">
          <BookCard
            v-for="book in books"
            :key="book.id"
            :book="book"
            :showActions="false"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page-body {
  background: #f4f8ff;
  display: flex;
  justify-content: center;
  padding: 2rem 1.2rem;
}

.page-wrapper {
  width: 100%;
  max-width: 1300px;
}

/* ── Intro ───────────────────────────────── */
.intro {
  background: #fff;
  border-radius: 14px;
  padding: 1.4rem 1.8rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
  font-size: .95rem;
  line-height: 1.7;
  color: #555;
  text-align: justify;
}
.intro strong { color: #0172c5; }

/* ── Search ──────────────────────────────── */
.search-row {
  display: flex;
  flex-direction: column;
  gap: .8rem;
  margin-bottom: 1.8rem;
}

.search-box {
  display: flex;
  background: #fff;
  border: 1.5px solid #9ccfff;
  border-radius: 99px;
  overflow: hidden;
  max-width: 480px;
  transition: border-color .2s;
}
.search-box:focus-within { border-color: #0172c5; }
.search-box input {
  border: none;
  outline: none;
  padding: .6rem 1.2rem;
  font-size: .95rem;
  flex: 1;
  background: transparent;
}
.search-box button {
  background: #0172c5;
  border: none;
  color: #fff;
  padding: .6rem 1.1rem;
  cursor: pointer;
  font-size: 1rem;
  transition: background .2s;
}
.search-box button:hover { background: #005fa3; }

/* ── Category chips ──────────────────────── */
.cat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
}
.cat-chip {
  background: #e0efff;
  color: #0172c5;
  border: 1.5px solid #b0d6ff;
  border-radius: 99px;
  padding: .28rem .9rem;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.cat-chip:hover { background: #0172c5; color: #fff; border-color: #0172c5; }

/* ── Books section ───────────────────────── */
.books-section {
  border-top: 3px solid #0172c5;
  padding-top: 1.4rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1.4rem;
  color: #1a1a1a;
}

.status { text-align: center; color: #888; padding: 2rem; }

.book-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  justify-items: center;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 600px) {
  .book-cards { grid-template-columns: repeat(2, 1fr); }
}
</style>
