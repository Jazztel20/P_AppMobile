<!-- Votre catalogue – livres ajoutés par l'utilisateur connecté, avec gestion des tags -->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '@/components/bookcard/BookCard.vue'
import { getBooks, getTags, type Book, type Tag } from '@/api/books'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// ─── State ────────────────────────────────────────────────────────────────────
const books          = ref<Book[]>([])
const tags           = ref<Tag[]>([])
const selectedTagId  = ref<number | null>(null)
const loading        = ref(true)

// ─── Load ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  if (!auth.isLoggedIn) {
    loading.value = false
    return
  }
  const [allBooks, userTags] = await Promise.all([getBooks(), getTags()])
  books.value = allBooks
  tags.value  = userTags
  loading.value = false
})

// ─── Computed ─────────────────────────────────────────────────────────────────
/** Livres appartenant à l'utilisateur connecté */
const myBooks = computed(() => {
  const userId = auth.user?.id
  if (!userId) return []
  return books.value.filter((b) => b.user_id === userId || (b as any).user?.id === userId)
})

/** Livres filtrés par tag sélectionné */
const filteredBooks = computed(() => {
  if (!selectedTagId.value) return myBooks.value
  const tag = tags.value.find((t) => t.id === selectedTagId.value)
  if (!tag?.books) return myBooks.value
  const tagBookIds = new Set(tag.books.map((b) => b.id))
  return myBooks.value.filter((b) => tagBookIds.has(b.id))
})

// ─── Tag filter chips ─────────────────────────────────────────────────────────
function selectTag(id: number | null) {
  selectedTagId.value = selectedTagId.value === id ? null : id
}

// ─── Handle deleted event from BookCard ──────────────────────────────────────
function handleDeleted(id: number) {
  books.value = books.value.filter((b) => b.id !== id)
}
</script>

<template>
  <div class="page-body">

    <!-- ── Top bar ─────────────────────────────────────────────────────── -->
    <div class="top-bar">
      <h1>Votre catalogue</h1>
      <router-link v-if="auth.isLoggedIn" :to="{ name: 'addbook' }" class="add-btn" id="add-book-btn">
        ➕ Ajouter un ouvrage
      </router-link>
    </div>

    <!-- Accès non connecté -->
    <div v-if="!auth.isLoggedIn" class="not-logged">
      <p>Vous devez être <router-link to="/login">connecté</router-link> pour voir votre catalogue.</p>
    </div>

    <!-- Loading -->
    <div v-else-if="loading" class="status">Chargement…</div>

    <template v-else>
      <!-- ── Tag filter chips ──────────────────────────────────────────── -->
      <div v-if="tags.length" class="tag-filters">
        <span class="filter-label">🏷️ Filtrer :</span>
        <button
          class="tag-chip"
          :class="{ active: selectedTagId === null }"
          @click="selectTag(null)"
        >Tous</button>
        <button
          v-for="tag in tags"
          :key="tag.id"
          class="tag-chip"
          :class="{ active: selectedTagId === tag.id }"
          @click="selectTag(tag.id)"
        >{{ tag.name }}</button>
      </div>

      <!-- ── Compte rendu ─────────────────────────────────────────────── -->
      <p v-if="filteredBooks.length === 0" class="status">
        {{ selectedTagId ? 'Aucun livre dans ce tag.' : 'Aucun livre dans votre catalogue.' }}
      </p>

      <!-- ── Grille de livres ─────────────────────────────────────────── -->
      <div v-else class="catalogue-grid">
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          :showActions="true"
          @deleted="handleDeleted"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-body {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  min-height: 60vh;
}

/* ── Top bar ─────────────────────────────── */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: .8rem;
}
.top-bar h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1a1a1a;
}
.add-btn {
  background: #22c55e;
  padding: 10px 20px;
  border-radius: 99px;
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: background .2s;
}
.add-btn:hover { background: #16a34a; }

/* ── Tag filter chips ────────────────────── */
.tag-filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: .5rem;
  margin-bottom: 1.5rem;
}
.filter-label { font-size: .85rem; font-weight: 700; color: #555; }
.tag-chip {
  background: #e0efff;
  color: #0172c5;
  border: 1.5px solid #b0d6ff;
  border-radius: 99px;
  padding: .3rem .9rem;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, color .2s;
}
.tag-chip:hover  { background: #c8e0ff; }
.tag-chip.active { background: #0172c5; color: #fff; border-color: #0172c5; }

/* ── Status / not logged ─────────────────── */
.status, .not-logged {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-size: 1rem;
}
.not-logged a { color: #0172c5; }

/* ── Grid ────────────────────────────────── */
.catalogue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 2rem;
  justify-items: center;
}

/* ── Responsive ──────────────────────────── */
@media (max-width: 600px) {
  .top-bar { flex-direction: column; align-items: flex-start; }
}
</style>
