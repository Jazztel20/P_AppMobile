<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchBook, updateBook } from '@/api/books'
import { getCategories as fetchCategories } from '@/api/categories'
import { getWriters as fetchWriters } from '@/api/writers'

const route  = useRoute()
const router = useRouter()
const bookId = Number(route.params.id)

// ─── State ────────────────────────────────────────────────────────────────────
const loading  = ref(true)
const saving   = ref(false)
const error    = ref<string | null>(null)
const success  = ref<string | null>(null)

const categories = ref<{ id: number; label: string }[]>([])
const writers    = ref<{ id: number; firstname: string; lastname: string }[]>([])

const form = reactive({
  title:          '' as string,
  abstract:       '' as string,
  editor:         '' as string,
  edition_year:   0  as number,
  number_of_pages: 0 as number,
  pdf_link:       '' as string,
  image_path:     '' as string,
  category_id:    0  as number,
  writer_id:      0  as number,
})

// ─── Load ─────────────────────────────────────────────────────────────────────
async function loadBook() {
  loading.value = true
  error.value   = null
  try {
    const [book, cats, writs] = await Promise.all([
      fetchBook(bookId),
      fetchCategories(),
      fetchWriters(),
    ])

    categories.value = cats
    writers.value    = writs

    // Remplissage du formulaire (gère les deux casses)
    form.title          = book.title           ?? ''
    form.abstract       = book.abstract        ?? ''
    form.editor         = book.editor          ?? ''
    form.edition_year   = (book.editionYear    ?? book.edition_year   ?? 0) as number
    form.number_of_pages = (book.numberOfPages ?? book.number_of_pages ?? 0) as number
    form.pdf_link       = (book.pdfLink        ?? book.pdf_link       ?? '') as string
    form.image_path     = (book.imagePath      ?? book.image_path     ?? '') as string
    form.category_id    = (book.category?.id   ?? book.category_id   ?? 0) as number
    form.writer_id      = (book.writer?.id     ?? book.writer_id     ?? 0) as number
  } catch (e: any) {
    error.value = e?.message ?? 'Impossible de charger le livre.'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (Number.isNaN(bookId)) {
    error.value = "ID de livre invalide dans l'URL."
    return
  }

  saving.value  = true
  error.value   = null
  success.value = null

  try {
    await updateBook(bookId, form)
    success.value = 'Livre mis à jour avec succès !'
    setTimeout(() => router.push({ name: 'catalogue' }), 1200)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? 'Impossible de mettre à jour le livre.'
  } finally {
    saving.value = false
  }
}

onMounted(loadBook)
</script>

<template>
  <div class="edit-page">
    <div class="card">
      <h2>Modifier un ouvrage</h2>

      <div v-if="loading" class="status">Chargement…</div>

      <template v-else>
        <p v-if="error"   class="alert-error">❌ {{ error }}</p>
        <p v-if="success" class="alert-ok">✅ {{ success }}</p>

        <form class="form-grid" @submit.prevent="onSubmit">
          <!-- Colonne gauche -->
          <div class="col">
            <label>
              Titre
              <input id="edit-title" v-model="form.title" type="text" placeholder="Titre" />
            </label>

            <label>
              Catégorie
              <select id="edit-category" v-model.number="form.category_id">
                <option disabled :value="0">Choisir…</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.label }}</option>
              </select>
            </label>

            <label>
              Nombre de pages
              <input id="edit-pages" v-model.number="form.number_of_pages" type="number" min="0" />
            </label>

            <label>
              Extrait (URL pdf)
              <input id="edit-pdf" v-model="form.pdf_link" type="url" placeholder="https://…" />
            </label>
          </div>

          <!-- Colonne milieu -->
          <div class="col">
            <label class="full-height">
              Résumé
              <textarea id="edit-abstract" v-model="form.abstract" placeholder="Résumé…"></textarea>
            </label>

            <label>
              Écrivain
              <select id="edit-writer" v-model.number="form.writer_id">
                <option disabled :value="0">Choisir…</option>
                <option v-for="w in writers" :key="w.id" :value="w.id">
                  {{ w.firstname }} {{ w.lastname }}
                </option>
              </select>
            </label>
          </div>

          <!-- Colonne droite -->
          <div class="col">
            <label>
              Éditeur
              <input id="edit-editor" v-model="form.editor" type="text" placeholder="Éditeur" />
            </label>

            <label>
              Année d'édition
              <input id="edit-year" v-model.number="form.edition_year" type="number" min="0" placeholder="2025" />
            </label>

            <label>
              Image de couverture (URL)
              <input id="edit-image" v-model="form.image_path" type="url" placeholder="https://…" />
            </label>

            <div v-if="form.image_path" class="preview">
              <img :src="form.image_path" alt="Aperçu couverture" />
            </div>
          </div>

          <!-- Actions -->
          <div class="actions">
            <button type="button" class="btn-cancel" @click="router.push({ name: 'catalogue' })">
              Annuler
            </button>
            <button type="button" class="btn-reset" @click="loadBook" :disabled="saving">
              Réinitialiser
            </button>
            <button type="submit" class="btn-submit" :disabled="saving">
              {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped>
.edit-page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
  min-height: 60vh;
}

.card {
  width: min(1000px, 100%);
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem 1.8rem;
}

h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.2rem;
  color: #1a1a1a;
}

.status { text-align: center; color: #888; padding: 2rem; }

.alert-error {
  background: #ffe4e4; border: 1px solid #ffc5c5;
  color: #800; border-radius: 8px; padding: .6rem 1rem; margin-bottom: .8rem;
}
.alert-ok {
  background: #e4ffe8; border: 1px solid #a5f3b0;
  color: #166534; border-radius: 8px; padding: .6rem 1rem; margin-bottom: .8rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 1.2rem;
}

.col label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: #444;
  margin-bottom: 12px;
}

.full-height textarea {
  flex: 1;
  min-height: 160px;
}

input, select, textarea {
  background: #d9f0ff;
  border: 1px solid #9ccfff;
  border-radius: 6px;
  padding: 7px 10px;
  outline: none;
  font-size: 12px;
  transition: border-color .2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #0172c5;
}

textarea { resize: vertical; }

.preview {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}
.preview img {
  width: 110px; height: 160px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  margin-top: .5rem;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #ccc;
  color: #444;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s;
}
.btn-cancel:hover { background: #f0f0f0; }

.btn-reset {
  background: #f59e0b;
  border: none;
  color: white;
  padding: 9px 18px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s;
}
.btn-reset:hover { background: #d97706; }
.btn-reset:disabled { opacity: .6; cursor: not-allowed; }

.btn-submit {
  background: #0172c5;
  border: none;
  color: white;
  padding: 9px 22px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s;
}
.btn-submit:hover { background: #005fa3; }
.btn-submit:disabled { opacity: .6; cursor: not-allowed; }

@media (max-width: 900px) {
  .form-grid { grid-template-columns: 1fr; }
  .actions { justify-content: space-between; }
}
</style>
