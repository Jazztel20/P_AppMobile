<!-- Livre Unique | Détails d'un livre -->

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createReview, fetchBook, fetchBookReviews, updateReview } from '@/api/books'
import type { BookReview } from '@/api/books'
import type { Book } from '@/models/Book'
import { useAuthStore } from '@/stores/auth'

const loading = ref(true)
const error = ref<string | null>(null)
const reviewsError = ref<string | null>(null)
const book = ref<Book | null>(null)
const reviews = ref<BookReview[]>([])
const hoverRating = ref<number | null>(null)
const selectedRating = ref<number | null>(null)
const isModalOpen = ref(false)
const commentText = ref('')
const modalError = ref<string | null>(null)
const isSubmitting = ref(false)
const editingReviewId = ref<number | null>(null)

const displayRating = computed(() => hoverRating.value ?? selectedRating.value ?? 0)
const hoverColor = '#4facfe'
const selectedColor = '#f5c518'
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id ?? null)
const currentUserReview = computed(() =>
  reviews.value.find((review) => review.userId === currentUserId.value),
)
const tooltipLeft = ref('0px')
const starsWrapRef = ref<HTMLElement | null>(null)

console.log("check", book.global_rating)
const route = useRoute()
const bookId = Number(route.params.id)

const ratingFromEvent = (event: MouseEvent, starIndex: number) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1)
  const rawRating = starIndex - 1 + percent
  return Math.round(rawRating * 10) / 10
}

const roundedRating = (value: number) => (value * 10) / 10

const starFill = (rating: number, starIndex: number) => {
  const start = starIndex - 1
  const end = starIndex
  if (rating >= end) return 100
  if (rating <= start) return 0
  return Math.round((rating - start) * 100)
}

const handleHover = (event: MouseEvent, starIndex: number) => {
  hoverRating.value = ratingFromEvent(event, starIndex)
  const wrap = starsWrapRef.value
  if (wrap) {
    const rect = wrap.getBoundingClientRect()
    tooltipLeft.value = `${event.clientX - rect.left}px`
  }
}

const handleLeave = () => {
  hoverRating.value = null
}

const handleSelect = (event: MouseEvent, starIndex: number) => {
  selectedRating.value = ratingFromEvent(event, starIndex)
  commentText.value = ''
  editingReviewId.value = null
  modalError.value = null
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const openEditReview = (review: BookReview) => {
  selectedRating.value = review.rating
  commentText.value = review.comment ?? ''
  editingReviewId.value = book.value?.id ?? bookId
  hoverRating.value = null
  modalError.value = null
  isModalOpen.value = true
}

const submitReview = async () => {
  if (currentUserId.value === null) {
    modalError.value = 'Veuillez vous connecter pour commenter.'
    return
  }
  if (selectedRating.value === null) {
    modalError.value = 'Veuillez sélectionner une note.'
    return
  }
  isSubmitting.value = true
  modalError.value = null
  try {
    let updatedReview: BookReview
    if (editingReviewId.value !== null) {
      updatedReview = await updateReview(editingReviewId.value, {
        book_id: book.value?.id ?? bookId,
        rating: selectedRating.value,
        comment: commentText.value,
      })
      const index = reviews.value.findIndex((review) => review.evaluateId === editingReviewId.value)
      if (index >= 0) {
        reviews.value[index] = updatedReview
      } else {
        reviews.value.unshift(updatedReview)
      }
    } else {
      if (!Number.isFinite(bookId) && !book.value?.id) {
        modalError.value = "Identifiant du livre invalide."
        return
      }
      updatedReview = await createReview({
        book_id: book.value?.id ?? bookId,
        rating: selectedRating.value,
        comment: commentText.value,
      })
      const existingIndex = reviews.value.findIndex((review) => review.userId === currentUserId.value)
      if (existingIndex >= 0) {
        reviews.value[existingIndex] = updatedReview
      } else {
        reviews.value.unshift(updatedReview)
      }
    }
    book.value = await fetchBook(bookId)
    isModalOpen.value = false
    commentText.value = ''
    editingReviewId.value = null
  } catch (e: Error) {
    modalError.value = e?.message ?? "Impossible d'enregistrer votre avis."
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  // Récupération d'un livre complet
  try {
    book.value = await fetchBook(bookId)
  } catch (e: Error) {
    error.value = e?.message ?? 'Failed to load book'
  }

  try {
    reviews.value = await fetchBookReviews(bookId)
  } catch (e: Error) {
    reviewsError.value = e?.message ?? 'Failed to load reviews'
  } finally {
    loading.value = false
  }
})

watch(
  currentUserReview,
  (review) => {
    if (review) {
      selectedRating.value = review.rating
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="page-container">
    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du livre...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <router-link to="/" class="back-btn">Retour à l'accueil</router-link>
    </div>

    <!-- Affichage du livre -->
    <main v-else-if="book" class="book-container">
      <div class="book-layout">
        <!-- Colonne gauche : Image -->
        <div class="book-image-section">
          <img :src="book.imagePath" :alt="book.title" class="book-cover" />
        </div>

        <!-- Colonne centrale : Détails + Résumé -->
        <div class="book-middle">
          <!-- Détails -->
          <div class="book-details-card">
            <h2 class="book-title-label">Titre</h2>
            <p class="book-title-value">{{ book.title }}</p>

            <h3 class="detail-label">Auteur</h3>
            <p class="detail-value">{{ book.writer?.firstname }} {{ book.writer?.lastname }}</p>

            <h3 class="detail-label">Publié le :</h3>
            <p class="detail-value">{{ book.editionYear }}</p>

            <h3 class="detail-label">Catégorie</h3>
            <p class="detail-value">{{ book.category.label }}</p>

            <h3 class="detail-label">Editeur</h3>
            <p class="detail-value">{{ book.editor }}</p>

            <h3 class="detail-label">Nombre de pages</h3>
            <p class="detail-value">{{ book.numberOfPages }}</p>
          </div>

          <!-- Résumé -->
          <div class="book-resume-card">
            <h2 class="resume-title">Résumé</h2>
            <p class="resume-text">{{ book.abstract }}</p>
            <router-link :to="`/books/${book.title}.pdf`" class="ebook-btn"> E-Book </router-link>
          </div>
        </div>

        <!-- Colonne droite : Notation -->
        <div class="book-rating-section">
          <div class="rating-card">
            <h3 class="rating-title">Note générale</h3>
            <div class="rating-score">{{ Number(book.global_rating).toFixed(1) }}</div>
            <div class="stars general-stars">
              <div class="stars-wrap">
                <div class="stars-layer" :style="{ '--star-color': '#4facfe' }">
                <div
                    v-for="i in 5"
                    :key="`general-star-${i}`"
                    class="star"
                    :style="{ '--star-rate': `${starFill(book.global_rating.toFixed(1), i)}` }"
                  ></div>
                </div>
                <div class="shadows-layer" aria-hidden="true">
                  <div v-for="i in 5" :key="`general-shadow-${i}`" class="star shadow"></div>
                </div>
              </div>
            </div>
            <p class="rating-count">{{ book.total_comments }} avis</p>
          </div>
          <div class="user-rating-card">
            <h4 class="user-rating-title">Add rating</h4>
            <div class="interactive-stars" @mouseleave="handleLeave">
              <div class="stars-wrap" ref="starsWrapRef">
                <div v-if="hoverRating !== null" class="star-tooltip" :style="{ left: tooltipLeft }">
                  {{ hoverRating.toFixed(1) }}
                </div>
                <div
                  class="stars-layer"
                  :style="{
                    '--star-color':
                      hoverRating !== null ? hoverColor : selectedRating !== null ? selectedColor : '#ddd',
                  }"
                >
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    class="star-hit"
                    @mousemove="(event) => handleHover(event, i)"
                    @click="(event) => handleSelect(event, i)"
                    :aria-label="`Noter ${i} étoile${i > 1 ? 's' : ''}`"
                  >
                    <div class="star" :style="{ '--star-rate': `${starFill(displayRating, i)}` }"></div>
                  </button>
                </div>
                <div class="shadows-layer" aria-hidden="true">
                  <div v-for="i in 5" :key="`shadow-${i}`" class="star shadow"></div>
                </div>
              </div>
            </div>
            <p v-if="selectedRating !== null" class="rating-value">
              {{ selectedRating.toFixed(1) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Section Commentaires -->
      <div class="comments-section">
        <div v-if="reviewsError" class="comments-error">❌ {{ reviewsError }}</div>
        <div v-else-if="reviews.length === 0" class="comments-empty">
          Aucun avis pour ce livre.
        </div>
        <div v-else v-for="(review, index) in reviews" :key="index" class="comment-card">
          <div class="comment-rating">
            <h4>Note</h4>
            <div class="stars-small">
              <div class="stars-wrap">
                <div class="stars-layer" :style="{ '--star-color': '#4facfe' }">
                  <div
                    v-for="i in 5"
                    :key="`comment-star-${index}-${i}`"
                    class="star"
                    :style="{ '--star-rate': `${starFill(roundedRating(review.rating), i)}` }"
                  ></div>
                </div>
                <div class="shadows-layer" aria-hidden="true">
                  <div v-for="i in 5" :key="`comment-shadow-${index}-${i}`" class="star shadow"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <p class="comment-author">{{ review.username ?? 'Utilisateur' }}</p>
              <button
                v-if="currentUserId !== null && review.userId === currentUserId"
                type="button"
                class="comment-edit-btn"
                @click="openEditReview(review)"
              >
                Modifier
              </button>
            </div>
            <p class="comment-text">{{ review.comment ?? 'Aucun commentaire.' }}</p>
          </div>
        </div>
      </div>
    </main>

    <div v-if="isModalOpen" class="modal-overlay" role="dialog" aria-modal="true">
      <div class="modal-card">
        <h3 class="modal-title">Votre avis</h3>
        <div class="modal-stars">
          <div class="stars-wrap modal-stars-wrap">
            <div class="stars-layer" :style="{ '--star-color': hoverColor }">
              <div
                v-for="i in 5"
                :key="`modal-star-${i}`"
                class="star"
                :style="{ '--star-rate': `${starFill(selectedRating ?? 0, i)}` }"
              ></div>
            </div>
            <div class="shadows-layer" aria-hidden="true">
              <div v-for="i in 5" :key="`modal-shadow-${i}`" class="star shadow"></div>
            </div>
          </div>
        </div>
        <textarea
          v-model="commentText"
          class="modal-textarea"
          rows="4"
          placeholder="Votre commentaire..."
        ></textarea>
        <p v-if="modalError" class="modal-error">❌ {{ modalError }}</p>
        <div class="modal-actions">
          <button type="button" class="modal-btn secondary" @click="closeModal">Annuler</button>
          <button type="button" class="modal-btn primary" @click="submitReview" :disabled="isSubmitting">
            {{ isSubmitting ? 'Envoi...' : 'Envoyer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  padding: 1.5rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 2.5rem;
}

.site-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
  text-align: center;
  font-family: 'Georgia', serif;
}

.user-badge {
  background: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-icon {
  font-size: 1.2rem;
}

/* Loading & Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  color: white;
  font-size: 1.3rem;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-btn {
  margin-top: 1rem;
  padding: 0.75rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 600;
  transition: transform 0.2s;
}

.back-btn:hover {
  transform: scale(1.05);
}

/* Main Content */
.book-container {
  flex: 1;
  padding: 2rem 3rem;
}

.book-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 2rem;
  margin-bottom: 2rem;
}

/* Image Section */
.book-image-section {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Middle Section */
.book-middle {
  display: flex;
  gap: 2rem;
}

.book-details-card,
.book-resume-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.book-title-label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.book-title-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  text-align: center;
}

.detail-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin-top: 1rem;
  text-align: center;
}

.detail-value {
  font-size: 1rem;
  color: #555;
  margin-bottom: 0.5rem;
  text-align: center;
}

.resume-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a1a1a;
}

.resume-text {
  line-height: 1.8;
  color: #444;
  margin-bottom: 2rem;
  text-align: justify;
}

.ebook-btn {
  display: inline-block;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 0.75rem 2.5rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  transition: transform 0.2s;
  text-align: center;
  margin: 0 auto;
  display: block;
  width: fit-content;
}

.ebook-btn:hover {
  transform: scale(1.05);
}

/* Rating Section */
.book-rating-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.rating-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  width: 100%;
}

.rating-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

.rating-score {
  font-size: 3rem;
  font-weight: 700;
  color: #667eea;
  margin: 1rem 0;
}

.stars {
  margin: 1rem 0;
}

.general-stars .stars-wrap {
  padding: 0.2rem 0.4rem;
}

.rating-count {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.user-rating-card {
  background: #f8fbff;
  border-radius: 15px;
  padding: 1.4rem 1.6rem;
  box-shadow: inset 0 0 0 1px #e1efff;
  text-align: center;
}

.user-rating-title {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.6rem;
}

.interactive-stars {
  position: relative;
  display: flex;
  gap: 0.3rem;
  align-items: center;
  justify-content: center;
  padding-top: 1.2rem;
}

.stars-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stars-layer,
.shadows-layer {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
  padding: 0.4rem 0.8rem;
}

.stars-layer {
  cursor: pointer;
  z-index: 2;
}

.shadows-layer {
  z-index: 1;
  pointer-events: none;
}

.star-tooltip {
  position: absolute;
  top: -40px;
  left: 0;
  transform: translateX(-50%);
  background: #ffffff;
  color: #1a1a1a;
  font-size: 0.75rem;
  padding: 0.25rem 0.55rem;
  border-radius: 8px;
  pointer-events: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.star-tooltip::after {
  content: '';
  position: absolute;
  left: 12px;
  bottom: -6px;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #ffffff;
}

.star-hit {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}

.star {
  width: 32px;
  aspect-ratio: 1;
  clip-path: polygon(
    50% 4%,
    61% 39%,
    98% 39%,
    68% 61%,
    79% 95%,
    50% 74%,
    21% 95%,
    32% 61%,
    2% 39%,
    39% 39%
  );
}

.star.shadow {
  background-color: #1f2933;
}

.stars-layer .star {
  background-color: transparent;
  background-image: linear-gradient(var(--star-color) 0%, var(--star-color) 100%);
  background-size: 200%;
  background-repeat: repeat-y;
  background-position-x: calc((100 + (100 - var(--star-rate, 0))) * 1%);
}

.rating-value {
  margin-top: 1.2rem;
  font-size: 0.95rem;
  color: #666;
}

/* Comments Section */
.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comments-empty,
.comments-error {
  background: white;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  color: #555;
}

.comment-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 2rem;
}

.comment-rating {
  min-width: 150px;
  text-align: center;
  border-right: 2px solid #eee;
  padding-right: 2rem;
}

.comment-rating h4 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: #333;
}

.stars-small {
  display: flex;
  justify-content: center;
}
.stars-small .stars-wrap {
  padding: 0.1rem 0.2rem;
}
.comment-rating .star {
  width: 22px;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.comment-author {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.comment-edit-btn {
  border: none;
  background: #e8f4ff;
  color: #2a7bd8;
  font-weight: 600;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  cursor: pointer;
}

.comment-edit-btn:hover {
  background: #d8ecff;
}

.comment-text {
  color: #555;
  line-height: 1.6;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 26, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  z-index: 50;
}

.modal-card {
  background: white;
  border-radius: 18px;
  padding: 2rem;
  width: min(520px, 100%);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.modal-title {
  font-size: 1.4rem;
  color: #222;
}

.modal-stars {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.modal-stars-wrap {
  position: relative;
  display: inline-block;
  width: calc(160px + 2.8rem);
  height: calc(32px + 0.8rem);
}

.modal-textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #ddd;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}

.modal-error {
  color: #c0392b;
  font-size: 0.95rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.modal-btn.primary {
  background: #4facfe;
  color: white;
}

.modal-btn.secondary {
  background: #f1f1f1;
  color: #333;
}

/* Footer */
.footer {
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  padding: 2rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #1a1a1a;
}

.footer-section {
  flex: 1;
}

.footer-center {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.footer-section h4 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.social-icons {
  display: flex;
  gap: 1rem;
  font-size: 1.5rem;
}

.footer-section p {
  margin: 0.3rem 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .book-layout {
    grid-template-columns: 1fr;
  }

  .book-rating-section {
    justify-content: center;
  }
}
</style>
