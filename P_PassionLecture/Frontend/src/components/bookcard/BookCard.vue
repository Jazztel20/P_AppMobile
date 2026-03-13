<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Book } from '@/api/books'
import { booksRatingAvg, deleteBook } from '@/api/books'

const props = defineProps<{
  book: Book
  showActions?: boolean
}>()

const emit = defineEmits<{ (e: 'deleted', id: number): void }>()

const router        = useRouter()
const averageRating = ref(0)
const deleting      = ref(false)

onMounted(async () => {
  try {
    const data = await booksRatingAvg(props.book.id)
    averageRating.value = Number(data.averageRating) || 0
  } catch {
    averageRating.value = 0
  }
})

function goEdit() {
  router.push({ name: 'edit', params: { id: props.book.id } })
}

async function handleDelete() {
  if (!confirm(`Supprimer « ${props.book.title} » ? Cette action est irréversible.`)) return
  deleting.value = true
  try {
    await deleteBook(props.book.id)
    emit('deleted', props.book.id)
  } catch (err) {
    alert('Impossible de supprimer le livre.')
  } finally {
    deleting.value = false
  }
}

// Normalise le champ image (camelCase vs snake_case)
const coverSrc = props.book.imagePath ?? props.book.image_path ?? ''
const placeholder = 'https://placehold.co/170x240?text=No+Image'
</script>

<template>
  <div class="book-card">
    <!-- Actions (edit / delete) visibles uniquement dans le catalogue -->
    <div v-if="showActions" class="card-actions">
      <button title="Modifier" class="action-btn" @click="goEdit">⚙️</button>
      <button
        title="Supprimer"
        class="action-btn delete"
        :disabled="deleting"
        @click="handleDelete"
      >🗑️</button>
    </div>

    <!-- Couverture -->
    <img
      :src="coverSrc || placeholder"
      :alt="book.title"
    />

    <!-- Titre -->
    <h2>{{ book.title }}</h2>

    <!-- Étoiles -->
    <div class="stars">
      <span v-for="n in Math.round(averageRating)" :key="n">★</span>
      <span v-if="averageRating === 0" class="no-rating">Pas encore noté</span>
    </div>

    <!-- Bouton voir -->
    <router-link :to="`/books/${book.id}`" class="view-btn">
      <span class="text">Voir l'évaluation</span>
      <span class="arrow">➜</span>
    </router-link>
  </div>
</template>

<style scoped>
.book-card {
  background: white;
  width: 220px;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.2s;
}
.book-card:hover { transform: translateY(-5px); }

/* ── Actions ─────────────────────────────── */
.card-actions {
  position: absolute;
  top: 10px; right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  opacity: 0.8;
  transition: transform 0.2s, opacity 0.2s;
}
.action-btn:hover { transform: scale(1.25); opacity: 1; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Image ───────────────────────────────── */
.book-card img {
  width: 155px;
  height: 225px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
}

/* ── Title ───────────────────────────────── */
.book-card h2 {
  font-size: 14px;
  margin-bottom: 6px;
  text-align: center;
  color: #1a1a1a;
}

/* ── Stars ───────────────────────────────── */
.stars {
  color: #2563eb;
  font-size: 1rem;
  margin-bottom: 10px;
}
.no-rating { font-size: .75rem; color: #aaa; }

/* ── Button ──────────────────────────────── */
.view-btn {
  margin-top: auto;
  border: 1.5px solid #2563eb;
  color: #2563eb;
  padding: 7px 14px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 13px;
  transition: background 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-width: 145px;
  overflow: hidden;
}
.view-btn:hover { background: #e0e7ff; }
.view-btn .text { transition: opacity 0.3s; white-space: nowrap; }
.view-btn:hover .text { opacity: 0; }
.view-btn .arrow {
  position: absolute;
  right: 14px;
  transition: transform 0.3s;
}
.view-btn:hover .arrow { transform: scale(1.3); }
</style>
