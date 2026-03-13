<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Book } from '@/api/books'
import { booksRatingAvg, deleteBook } from '@/api/books'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ book: Book; showActions?: boolean }>()
const emit = defineEmits<{
  (e: 'deleted', id: number): void
}>()

const auth = useAuthStore()

const averageRating = ref(0)
const deleting = ref(false)
const error = ref<string | null>(null)
const showConfirm = ref(false)
const isAuthor = computed(() => {
  const currentUserId = auth.user?.id
  if (!currentUserId) return false
  const bookAny = props.book as any
  return bookAny.userId === currentUserId || bookAny.user?.id === currentUserId
})

async function handleDelete() {
  error.value = null
  if (deleting.value) return

  showConfirm.value = true
}

async function confirmDelete() {
  if (deleting.value) return

  try {
    deleting.value = true
    await deleteBook(props.book.id)
    emit('deleted', props.book.id)
  } catch (err: any) {
    error.value = err?.response?.data?.message || err?.message || 'Suppression impossible.'
  } finally {
    showConfirm.value = false
    deleting.value = false
  }
}

function cancelDelete() {
  showConfirm.value = false
}

onMounted(async () => {
  try {
    const data = await booksRatingAvg(props.book.id)
    // S'assurer que c'est un nombre
    averageRating.value = Number(data.averageRating) || 0
  } catch (err) {
    console.error('Failed to load average rating:', err)
    averageRating.value = 0
  }
})
</script>

<template>
  <div class="book-card">
    <!-- ✅ Optional Action buttons -->
    <div v-if="showActions" class="card-actions">
      <router-link :to="`/books/edit/${book.id}`" title="Modifier" class="action-btn">
        ⚙️
      </router-link>

      <button
        type="button"
        title="Supprimer"
        class="action-btn delete"
        :disabled="deleting"
        @click="handleDelete"
        v-if="isAuthor"
      >
        {{ deleting ? '…' : '🗑️' }}
      </button>
    </div>

    <!-- Image -->
    <img
      :src="book.imagePath || (book as any).image_path || 'https://via.placeholder.com/170x240?text=No+Image'"
      alt="Couverture"
    />

    <!-- Title -->
    <h2>{{ book.title }}</h2>

    <!-- Stars -->
    <div class="stars">
      <span v-for="n in Math.round(averageRating)" :key="n">★</span>
      <span v-if="averageRating === 0">Pas encore noté</span>
    </div>

    <!-- Button -->
    <router-link :to="`/books/${book.id}`" class="view-btn">
      <span class="text">Voir l'évaluation</span>
      <span class="arrow">➜</span>
    </router-link>

    <p v-if="error" class="error-text">{{ error }}</p>

    <!-- Confirmation modal -->
    <teleport to="body">
      <div v-if="showConfirm" class="modal-backdrop">
        <div class="modal">
          <h3>Confirmation</h3>
          <p>
            Are you sure you want to delete
            "<span class="book-title">{{ book.title }}</span>"?
          </p>
          <p class="modal-warning">Cette action est définitive.</p>

          <div class="modal-actions">
            <button class="btn btn-secondary" type="button" @click="cancelDelete">Annuler</button>
            <button class="btn btn-danger" type="button" :disabled="deleting" @click="confirmDelete">
              {{ deleting ? 'Suppression…' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
.book-card {
  background: white;
  width: 230px;
  padding: 16px;
  border-radius: 14px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: 0.2s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.card-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  border: none;
  cursor: pointer;
  font-size: 20px;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
  opacity: 0.85;
}

.action-btn:hover {
  transform: scale(1.25);
  opacity: 1;
}

.book-card img {
  width: 170px;
  height: 240px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
}

.book-card h2 {
  font-size: 16px;
  margin-bottom: 6px;
  text-align: center;
}

.stars {
  color: #2563eb;
  margin-bottom: 12px;
}

.view-btn {
  margin-top: auto;
  border: 1px solid #2563eb;
  color: #2563eb;
  padding: 8px 14px;
  border-radius: 20px;
  text-decoration: none;
  font-size: 14px;
  transition: 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center; /* centrer le contenu */
  position: relative; /* pour positionner le texte absolu */
  min-width: 150px; /* largeur fixe du bouton */
  overflow: hidden;
}

.view-btn:hover {
  background: #e0e7ff;
}

/* Texte disparaît, mais bouton reste même largeur */
.view-btn .text {
  transition: opacity 0.3s ease;
  white-space: nowrap;
}

.view-btn:hover .text {
  opacity: 0;
}

/* Flèche au-dessus du texte */
.view-btn .arrow {
  position: absolute;
  right: 14px; /* alignée à droite */
  transition: transform 0.3s ease;
}

.view-btn:hover .arrow {
  transform: scale(1.3);
}

.error-text {
  margin-top: 8px;
  color: #b91c1c;
  font-size: 13px;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  padding: 18px 20px;
  width: min(360px, 90vw);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
}

.modal h3 {
  margin-bottom: 6px;
  font-size: 18px;
  color: #1f2937;
}

.modal p {
  margin-bottom: 10px;
  color: #4b5563;
  font-size: 14px;
}

.modal .book-title {
  color: #111827;
  font-weight: 700;
}

.modal-warning {
  margin-bottom: 14px;
  color: #9f1239;
  font-size: 13px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  border: none;
  padding: 9px 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 14px;
  transition: 0.15s ease;
}

.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
