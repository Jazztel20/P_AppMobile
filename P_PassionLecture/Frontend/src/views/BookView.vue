<!-- Livre Unique | Détails d'un livre -->

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchBook,
  getBookReviews,
  booksRatingAvg,
  postComment,
  postEvaluate,
  getTags,
  createTag,
  attachBookToTag,
  type Book,
  type Review,
  type Tag,
} from '@/api/books'
import { useAuthStore } from '@/stores/auth'

// ─── State ────────────────────────────────────────────────────────────────────
const loading    = ref(true)
const error      = ref<string | null>(null)
const book       = ref<Book | null>(null)
const reviews    = ref<Review[]>([])
const avgRating  = ref(0)

// Formulaire de soumission d'avis
const myRating   = ref(0)
const myComment  = ref('')
const submitting = ref(false)
const submitErr  = ref<string | null>(null)
const submitOk   = ref(false)

// Tags popup
const showTagPopup   = ref(false)
const tags           = ref<Tag[]>([])
const newTagName     = ref('')
const newTagDesc     = ref('')
const tagError       = ref<string | null>(null)
const tagSuccess     = ref<string | null>(null)

// ─── Setup ───────────────────────────────────────────────────────────────────
const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()
const bookId = Number(route.params.id)

onMounted(async () => {
  try {
    book.value    = await fetchBook(bookId)
    reviews.value = await getBookReviews(bookId)
    const rdata   = await booksRatingAvg(bookId)
    avgRating.value = Number(rdata.averageRating) || 0
  } catch (e: any) {
    error.value = e?.message ?? 'Impossible de charger le livre.'
  } finally {
    loading.value = false
  }
})

// ─── Computed ────────────────────────────────────────────────────────────────
const filledStars  = computed(() => Math.round(avgRating.value))
const coverImage   = computed(() =>
  book.value?.imagePath ?? book.value?.image_path ?? 'https://placehold.co/200x280?text=No+Image'
)
const writerName   = computed(() => {
  const w = book.value?.writer
  if (!w) return '—'
  return `${w.firstname} ${w.lastname}`
})
const categoryLabel = computed(() => book.value?.category?.label ?? '—')
const pages         = computed(() => book.value?.numberOfPages ?? book.value?.number_of_pages ?? '—')
const edYear        = computed(() => book.value?.editionYear ?? book.value?.edition_year ?? '—')

// ─── Poster un avis ──────────────────────────────────────────────────────────
async function submitReview() {
  submitErr.value = null
  submitOk.value  = false

  if (!auth.isLoggedIn) {
    submitErr.value = 'Vous devez être connecté pour laisser un avis.'
    return
  }
  if (myRating.value < 1 || myRating.value > 5) {
    submitErr.value = 'Veuillez choisir une note entre 1 et 5.'
    return
  }

  submitting.value = true
  try {
    await postEvaluate(bookId, myRating.value)
    if (myComment.value.trim()) {
      await postComment(bookId, myComment.value.trim())
    }
    // Rafraîchir les avis
    reviews.value   = await getBookReviews(bookId)
    const rdata     = await booksRatingAvg(bookId)
    avgRating.value = Number(rdata.averageRating) || 0
    myRating.value  = 0
    myComment.value = ''
    submitOk.value  = true
  } catch (e: any) {
    submitErr.value = e?.response?.data?.message ?? e?.message ?? 'Erreur lors de la soumission.'
  } finally {
    submitting.value = false
  }
}

// ─── Tags popup ──────────────────────────────────────────────────────────────
async function openTagPopup() {
  tagError.value   = null
  tagSuccess.value = null
  newTagName.value = ''
  newTagDesc.value = ''
  tags.value       = await getTags()
  showTagPopup.value = true
}

async function handleCreateTag() {
  tagError.value   = null
  tagSuccess.value = null
  if (!newTagName.value.trim()) {
    tagError.value = 'Le nom du tag est obligatoire.'
    return
  }
  try {
    const tag = await createTag(newTagName.value.trim(), newTagDesc.value.trim())
    await attachBookToTag(tag.id, bookId)
    tags.value       = await getTags()
    newTagName.value = ''
    newTagDesc.value = ''
    tagSuccess.value = `Tag "${tag.name}" créé et ajouté au livre.`
  } catch (e: any) {
    tagError.value = e?.response?.data?.message ?? e?.message ?? 'Erreur lors de la création du tag.'
  }
}

async function handleAttachTag(tag: Tag) {
  tagError.value   = null
  tagSuccess.value = null
  try {
    await attachBookToTag(tag.id, bookId)
    tags.value       = await getTags()
    tagSuccess.value = `Tag "${tag.name}" ajouté au livre.`
  } catch (e: any) {
    tagError.value = e?.response?.data?.message ?? e?.message ?? 'Erreur.'
  }
}

// Vérifie si ce livre est déjà dans un tag
function bookInTag(tag: Tag): boolean {
  return (tag.books ?? []).some((b) => b.id === bookId)
}
</script>

<template>
  <div class="page-container">

    <!-- ── Chargement ─────────────────────────────────────────────────────── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Chargement du livre…</p>
    </div>

    <!-- ── Erreur ─────────────────────────────────────────────────────────── -->
    <div v-else-if="error" class="error-state">
      <p>❌ {{ error }}</p>
      <router-link to="/" class="back-btn">Retour à l'accueil</router-link>
    </div>

    <!-- ── Affichage du livre ─────────────────────────────────────────────── -->
    <main v-else-if="book" class="book-container">

      <!-- Bouton Tag (flottant, coin haut-gauche) -->
      <button
        v-if="auth.isLoggedIn"
        class="tag-fab"
        title="Gérer les tags"
        @click="openTagPopup"
      >🏷️</button>

      <div class="book-layout">
        <!-- Colonne gauche : Image -->
        <div class="book-image-section">
          <img :src="coverImage" :alt="book.title" class="book-cover" />
          <router-link
            v-if="book.pdfLink || book.pdf_link"
            :to="`/books/${book.id}/read`"
            class="ebook-btn"
          >📖 Lire (E-Book)</router-link>
        </div>

        <!-- Colonne centrale : Détails + Résumé -->
        <div class="book-middle">
          <div class="book-details-card">
            <h1 class="book-title-value">{{ book.title }}</h1>
            <div class="detail-row">
              <span class="detail-label">Auteur</span>
              <span class="detail-value">{{ writerName }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Catégorie</span>
              <span class="detail-value">{{ categoryLabel }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Éditeur</span>
              <span class="detail-value">{{ book.editor ?? '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Année</span>
              <span class="detail-value">{{ edYear }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pages</span>
              <span class="detail-value">{{ pages }}</span>
            </div>
          </div>

          <div class="book-resume-card">
            <h2 class="resume-title">Résumé</h2>
            <p class="resume-text">{{ book.abstract ?? 'Aucun résumé disponible.' }}</p>
          </div>
        </div>

        <!-- Colonne droite : Note globale -->
        <div class="book-rating-section">
          <div class="rating-card">
            <h3 class="rating-title">Note générale</h3>
            <div class="rating-score">{{ avgRating ? avgRating.toFixed(1) : '—' }}</div>
            <div class="stars">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= filledStars }"
              >★</span>
            </div>
            <p class="rating-count">{{ reviews.length }} avis</p>
          </div>
        </div>
      </div>

      <!-- ── Section Avis ──────────────────────────────────────────────── -->
      <section class="comments-section">
        <h2 class="section-heading">Avis de la communauté</h2>

        <!-- Avis existants -->
        <div v-if="reviews.length === 0" class="no-reviews">
          Soyez le premier à laisser un avis !
        </div>

        <div v-for="(rev, idx) in reviews" :key="idx" class="comment-card">
          <div class="comment-rating">
            <h4>Note</h4>
            <div class="stars-small">
              <span
                v-for="i in 5"
                :key="i"
                class="star"
                :class="{ filled: i <= rev.rating }"
              >★</span>
            </div>
            <p class="rating-num">{{ rev.rating }}/5</p>
          </div>
          <div class="comment-content">
            <p class="comment-author">{{ rev.username ?? 'Utilisateur' }}</p>
            <p class="comment-text">{{ rev.comment ?? 'Aucun commentaire.' }}</p>
          </div>
        </div>

        <!-- Formulaire d'ajout d'avis -->
        <div v-if="auth.isLoggedIn" class="add-review-card">
          <h3>Laisser un avis</h3>

          <p v-if="submitErr" class="alert-error">{{ submitErr }}</p>
          <p v-if="submitOk"  class="alert-ok">✅ Votre avis a été enregistré !</p>

          <div class="star-picker">
            <span
              v-for="i in 5"
              :key="i"
              class="star pick"
              :class="{ filled: i <= myRating }"
              @click="myRating = i"
            >★</span>
          </div>

          <textarea
            v-model="myComment"
            placeholder="Votre commentaire (facultatif)…"
          ></textarea>

          <button class="submit-btn" :disabled="submitting" @click="submitReview">
            {{ submitting ? 'Envoi…' : 'Publier mon avis' }}
          </button>
        </div>
        <p v-else class="login-prompt">
          <router-link to="/login">Connectez-vous</router-link> pour laisser un avis.
        </p>
      </section>
    </main>

    <!-- ── Popup Tags ─────────────────────────────────────────────────────── -->
    <transition name="fade">
      <div v-if="showTagPopup" class="overlay" @click.self="showTagPopup = false">
        <div class="tag-modal">
          <button class="close-btn" @click="showTagPopup = false">✕</button>
          <h2>Créer un tag pour ce livre</h2>

          <p v-if="tagError"   class="alert-error">{{ tagError }}</p>
          <p v-if="tagSuccess" class="alert-ok">{{ tagSuccess }}</p>

          <label class="modal-label">Nom du tag</label>
          <input v-model="newTagName" type="text" placeholder="Ex: À lire" />

          <label class="modal-label">Description du tag</label>
          <textarea v-model="newTagDesc" placeholder="Ex: Je veux le lire bientôt !"></textarea>

          <button class="confirm-btn" @click="handleCreateTag">Confirmer</button>

          <!-- Tags existants -->
          <div v-if="tags.length" class="existing-tags">
            <h3>Vos tags existants</h3>
            <div
              v-for="tag in tags"
              :key="tag.id"
              class="tag-chip"
              :class="{ active: bookInTag(tag) }"
              @click="handleAttachTag(tag)"
              :title="bookInTag(tag) ? 'Déjà ajouté' : 'Ajouter ce tag'"
            >
              {{ tag.name }}
              <span v-if="bookInTag(tag)"> ✔</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; margin: 0; padding: 0; }

.page-container {
  min-height: 100vh;
  background: #f4f8ff;
}

/* ── Loading / Error ─────────────────────── */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  gap: 1rem;
  font-size: 1.2rem;
  color: #555;
}
.spinner {
  width: 50px; height: 50px;
  border: 5px solid rgba(0,0,0,.1);
  border-top-color: #0172c5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.back-btn {
  display: inline-block;
  padding: .6rem 1.5rem;
  background: #0172c5;
  color: #fff;
  text-decoration: none;
  border-radius: 99px;
  font-weight: 600;
  transition: opacity .2s;
}
.back-btn:hover { opacity: .85; }

/* ── Tag FAB ─────────────────────────────── */
.tag-fab {
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 52px; height: 52px;
  border: none;
  border-radius: 50%;
  background: #0172c5;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
  z-index: 100;
  transition: transform .2s;
}
.tag-fab:hover { transform: scale(1.1); }

/* ── Main layout ─────────────────────────── */
.book-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.book-layout {
  display: grid;
  grid-template-columns: 220px 1fr 260px;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

/* ── Image section ──────────────────────── */
.book-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
.book-cover {
  width: 100%;
  max-width: 200px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0,0,0,.2);
  object-fit: cover;
}
.ebook-btn {
  display: inline-block;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: #fff;
  padding: .65rem 1.4rem;
  border-radius: 25px;
  text-decoration: none;
  font-weight: 600;
  font-size: .9rem;
  transition: transform .2s;
  white-space: nowrap;
}
.ebook-btn:hover { transform: scale(1.05); }

/* ── Middle section ─────────────────────── */
.book-middle {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.book-details-card,
.book-resume-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.6rem;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
}

.book-title-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  gap: .8rem;
  margin-bottom: .5rem;
  align-items: baseline;
}
.detail-label {
  font-size: .82rem;
  font-weight: 700;
  color: #666;
  min-width: 90px;
  text-transform: uppercase;
  letter-spacing: .03em;
}
.detail-value {
  font-size: .95rem;
  color: #333;
}

.resume-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: .8rem;
  color: #1a1a1a;
}
.resume-text {
  line-height: 1.8;
  color: #555;
  text-align: justify;
}

/* ── Rating card ────────────────────────── */
.book-rating-section { display: flex; align-items: flex-start; }
.rating-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.6rem;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
  text-align: center;
  width: 100%;
}
.rating-title {
  font-size: 1rem;
  font-weight: 600;
  color: #555;
  margin-bottom: .6rem;
}
.rating-score {
  font-size: 3rem;
  font-weight: 700;
  color: #0172c5;
}
.stars { font-size: 1.8rem; color: #ddd; margin: .6rem 0; }
.star.filled { color: #4facfe; }
.rating-count { font-size: .9rem; color: #888; }

/* ── Comments section ───────────────────── */
.comments-section { margin-top: .5rem; }
.section-heading {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  padding-bottom: .5rem;
  border-bottom: 3px solid #0172c5;
}

.no-reviews {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #888;
  margin-bottom: 1rem;
}

.comment-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}
.comment-rating {
  min-width: 120px;
  text-align: center;
  border-right: 2px solid #eee;
  padding-right: 1.5rem;
}
.comment-rating h4 { font-size: .9rem; margin-bottom: .5rem; color: #555; }
.stars-small { font-size: 1.3rem; color: #ddd; }
.stars-small .star.filled { color: #4facfe; }
.rating-num { font-size: .8rem; color: #888; margin-top: .3rem; }
.comment-content { flex: 1; }
.comment-author { font-weight: 700; font-size: 1rem; margin-bottom: .3rem; color: #222; }
.comment-text { color: #555; line-height: 1.6; }

/* ── Add review form ────────────────────── */
.add-review-card {
  background: #fff;
  border-radius: 14px;
  padding: 1.6rem;
  box-shadow: 0 4px 16px rgba(0,0,0,.08);
  margin-top: 1.5rem;
}
.add-review-card h3 { font-size: 1.1rem; margin-bottom: 1rem; }
.star-picker { font-size: 2rem; cursor: pointer; margin-bottom: 1rem; }
.star-picker .star { color: #ddd; transition: color .15s; }
.star-picker .star.filled { color: #4facfe; }
.star-picker .star.pick:hover { color: #4facfe; }
.add-review-card textarea {
  width: 100%; min-height: 90px; resize: vertical;
  border: 1px solid #cde4ff; border-radius: 8px;
  padding: .7rem; font-size: .95rem; margin-bottom: 1rem;
  background: #f0f8ff;
}
.submit-btn {
  background: #0172c5; color: #fff;
  border: none; padding: .7rem 2rem;
  border-radius: 99px; font-size: .95rem;
  font-weight: 700; cursor: pointer; transition: opacity .2s;
}
.submit-btn:hover { opacity: .87; }
.submit-btn:disabled { opacity: .6; cursor: not-allowed; }

.login-prompt { margin-top: 1rem; color: #888; font-size: .9rem; }
.login-prompt a { color: #0172c5; }

/* ── Alerts ─────────────────────────────── */
.alert-error {
  background: #ffe4e4; border: 1px solid #ffc5c5;
  color: #800; border-radius: 8px; padding: .6rem 1rem; margin-bottom: .8rem;
}
.alert-ok {
  background: #e4ffe8; border: 1px solid #a5f3b0;
  color: #166534; border-radius: 8px; padding: .6rem 1rem; margin-bottom: .8rem;
}

/* ── Tag popup ──────────────────────────── */
.overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.tag-modal {
  background: #fff;
  border-radius: 16px;
  padding: 2rem;
  width: min(460px, 92vw);
  position: relative;
  box-shadow: 0 12px 40px rgba(0,0,0,.2);
}
.close-btn {
  position: absolute; top: 1rem; right: 1rem;
  background: none; border: none; font-size: 1.2rem;
  cursor: pointer; color: #888;
}
.tag-modal h2 { font-size: 1.1rem; margin-bottom: 1.2rem; color: #0172c5; text-align: center; }
.modal-label {
  display: block;
  font-size: .82rem; font-weight: 700; color: #555;
  margin-bottom: .35rem;
}
.tag-modal input,
.tag-modal textarea {
  width: 100%; border: 1px solid #b0d6ff;
  border-radius: 8px; padding: .6rem .8rem;
  font-size: .95rem; background: #f0f8ff;
  margin-bottom: 1rem;
}
.tag-modal textarea { min-height: 80px; resize: vertical; }
.confirm-btn {
  display: block; width: 100%;
  background: #22c55e; color: #fff;
  border: none; padding: .75rem;
  border-radius: 8px; font-size: 1rem;
  font-weight: 700; cursor: pointer; transition: background .2s;
}
.confirm-btn:hover { background: #16a34a; }

.existing-tags { margin-top: 1.4rem; }
.existing-tags h3 { font-size: .9rem; font-weight: 700; color: #555; margin-bottom: .6rem; }
.tag-chip {
  display: inline-block;
  background: #e0efff; color: #0172c5;
  border-radius: 99px; padding: .3rem .9rem;
  font-size: .85rem; font-weight: 600;
  margin: .25rem .25rem 0 0;
  cursor: pointer; transition: background .2s;
}
.tag-chip:hover   { background: #c8e0ff; }
.tag-chip.active  { background: #0172c5; color: #fff; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 1000px) {
  .book-layout { grid-template-columns: 1fr; }
  .book-image-section { flex-direction: row; justify-content: flex-start; align-items: flex-start; }
}

/* ── Transition ─────────────────────────── */
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
