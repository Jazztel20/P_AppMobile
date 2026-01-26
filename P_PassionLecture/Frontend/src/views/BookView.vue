<!-- Livre Unique | Détails d'un livre -->

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchBook } from '@/api/books'
import { Book } from '@/models/book'

const loading = ref(true)
const error = ref<string | null>(null)
const book = ref<Book | null>(null)

const route = useRoute()
const bookId = route.params.id as number

onMounted(async () => {
  // Récupération d'un livre complet
  try {
    book.value = await fetchBook(bookId)
  } catch (e: Error) {
    error.value = e?.message ?? 'Failed to load book'
  } finally {
    loading.value = false
  }
})
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
            <div class="rating-score">{{ book.global_rating }}</div>
            <div class="stars">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= Math.round(book.global_rating) }"
                >★</span
              >
            </div>
            <p class="rating-count">{{ book.total_comments }} avis</p>
          </div>
        </div>
      </div>

      <!-- Section Commentaires -->
      <div class="comments-section">
        <div class="comment-card">
          <div class="comment-rating">
            <h4>Ma note</h4>
            <div class="stars-small">
              <span v-for="i in 5" :key="i" class="star filled">★</span>
            </div>
          </div>
          <div class="comment-content">
            <p class="comment-author">Theosore</p>
            <p class="comment-text">
              J'ai adoré la partie sur l'argent lybien qu'il n'a pas gardé sous son lit
            </p>
          </div>
        </div>

        <div class="comment-card">
          <div class="comment-rating">
            <h4>Ma note</h4>
            <div class="stars-small">
              <span v-for="i in 2" :key="i" class="star filled">★</span>
              <span v-for="i in 3" :key="i + 2" class="star">★</span>
            </div>
          </div>
          <div class="comment-content">
            <p class="comment-author">Matiammo</p>
            <p class="comment-text">
              Je n'ai pas trop aimé la partie sur sa confiance à ne pas aller en prison...
              Aujourd'hui on voit que c'est faux !
            </p>
          </div>
        </div>
      </div>
    </main>
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
  align-items: flex-start;
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
  font-size: 2rem;
  color: #ddd;
  margin: 1rem 0;
}

.star.filled {
  color: #4facfe;
}

.rating-count {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

/* Comments Section */
.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  font-size: 1.5rem;
  color: #ddd;
}

.stars-small .star.filled {
  color: #4facfe;
}

.comment-content {
  flex: 1;
}

.comment-author {
  font-weight: 700;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.comment-text {
  color: #555;
  line-height: 1.6;
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
