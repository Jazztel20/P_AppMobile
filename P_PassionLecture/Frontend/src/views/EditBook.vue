<script lang="ts" setup>
import type { Book } from '@/models/Book'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchBook, updateBook, type CreateBookPayload } from '@/api/books'
import { getCategories, type Category } from '@/api/categories'
import { getWriters, createWriter, type Writer } from '@/api/writers'

const route = useRoute()
const router = useRouter()

const bookId = Number(route.params.id)

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const book = ref<Book | null>(null)

const categories = ref<Category[]>([])
const writers = ref<Writer[]>([])

const writerFirstName = ref('')
const writerLastName = ref('')

const form = reactive<CreateBookPayload>({
  title: '',
  category_id: 0,
  number_of_pages: 0,
  pdf_link: '',
  abstract: '',
  editor: '',
  edition_year: new Date().getFullYear(),
  image_path: '',
  writer_id: 0,
})

function hydrateForm(b: Book) {
  form.title = b.title ?? ''
  form.category_id = b.categoryId ?? b.category?.id ?? 0
  form.writer_id = b.writerId ?? b.writer?.id ?? 0
  form.number_of_pages = b.numberOfPages ?? 0
  form.pdf_link = b.pdfLink ?? ''
  form.abstract = b.abstract ?? ''
  form.editor = b.editor ?? ''
  form.edition_year = b.editionYear ?? new Date().getFullYear()
  form.image_path = b.imagePath ?? ''
}

async function loadBook() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const [bookData, categoriesData, writersData] = await Promise.all([
      fetchBook(bookId),
      getCategories(),
      getWriters(),
    ])

    book.value = bookData
    categories.value = categoriesData
    writers.value = writersData
    hydrateForm(bookData)
  } catch (e: Error) {
    error.value = e?.message ?? 'Failed to load book'
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!bookId || Number.isNaN(bookId)) {
    error.value = "ID de livre invalide dans l'URL"
    return
  }

  error.value = null
  success.value = null

  if (!form.title.trim()) return (error.value = 'Le titre est obligatoire.')
  if (!form.category_id) return (error.value = 'Veuillez choisir une catégorie.')
  if (form.number_of_pages <= 0) return (error.value = 'Le nombre de pages doit être supérieur à 0.')
  if (!form.image_path.trim()) return (error.value = "L'URL de l'image est obligatoire.")

  saving.value = true

  if (form.writer_id === 0) {
    if (!writerFirstName.value.trim() || !writerLastName.value.trim()) {
      error.value = 'Renseigne prénom + nom pour créer un écrivain.'
      saving.value = false
      return
    }

    try {
      const created = await createWriter(writerFirstName.value.trim(), writerLastName.value.trim())
      writers.value = await getWriters()
      form.writer_id = created.id
    } catch (err: any) {
      error.value = err?.response?.data?.message || err?.message || "Impossible de créer l'écrivain."
      saving.value = false
      return
    }
  }

  if (!form.writer_id) {
    saving.value = false
    return (error.value = 'Veuillez choisir un écrivain.')
  }

  try {
    const updated = await updateBook(bookId, form)

    book.value = updated
    hydrateForm(updated)

    success.value = 'Livre mis à jour.'
    // optionnel : rediriger après succès
    // router.push({ name: 'book', params: { id: bookId } })
  } catch (e: Error) {
    error.value = e?.message ?? 'Failed to update book'
  } finally {
    saving.value = false
  }
}

onMounted(loadBook)
</script>

<template>
  <div class="addbook-page">
    <div class="card">
      <h2>Veuillez remplir les champs pour modifier un ouvrage</h2>

      <p v-if="loading" class="state">Chargement…</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <p v-else-if="success" class="success">{{ success }}</p>

      <form v-if="!loading" class="form-grid" @submit.prevent="onSubmit">
        <!-- Colonne gauche -->
        <div class="col">
          <label>
            Titre
            <input v-model="form.title" type="text" placeholder="Titre" />
          </label>

          <label>
            Catégorie
            <select v-model.number="form.category_id">
              <option disabled :value="0">Choisir...</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">
                {{ c.label }}
              </option>
            </select>
          </label>

          <label>
            Nombre de pages
            <input v-model.number="form.number_of_pages" type="number" min="1" placeholder="0" />
          </label>

          <label>
            Extrait (pdf)
            <input v-model="form.pdf_link" type="url" placeholder="https://..." />
          </label>
        </div>

        <!-- Colonne milieu -->
        <div class="col">
          <label class="full-height">
            Résumé
            <textarea v-model="form.abstract" placeholder="Résumé..."></textarea>
          </label>

          <label>
            Écrivain (existant)
            <select v-model.number="form.writer_id">
              <option :value="0">— Créer un nouvel écrivain —</option>
              <option v-for="w in writers" :key="w.id" :value="w.id">
                {{ w.firstname }} {{ w.lastname }} ({{ w.id }})
              </option>
            </select>
          </label>

          <div v-if="form.writer_id === 0" class="writer-create">
            <label>
              Prénom
              <input v-model="writerFirstName" type="text" placeholder="Prénom" />
            </label>
            <label>
              Nom
              <input v-model="writerLastName" type="text" placeholder="Nom" />
            </label>
          </div>
        </div>

        <!-- Colonne droite -->
        <div class="col">
          <label>
            Éditeur
            <input v-model="form.editor" type="text" placeholder="Éditeur" />
          </label>

          <label>
            Année d’édition
            <input v-model.number="form.edition_year" type="number" min="0" placeholder="2025" />
          </label>

          <label>
            Image de couverture (URL)
            <input v-model="form.image_path" type="url" placeholder="https://..." />
          </label>

          <div v-if="form.image_path" class="preview">
            <img :src="form.image_path" alt="Aperçu couverture" />
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn-cancel" @click="router.back()">Annuler</button>
          <button type="submit" class="btn-submit" :disabled="saving">
            {{ saving ? 'Enregistrement…' : 'Enregistrer l’ouvrage' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.addbook-page {
  display: flex;
  justify-content: center;
  padding: 30px 15px;
  margin-bottom: 215px;
}

.card {
  width: min(980px, 100%);
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  padding: 24px 26px;
}

h2 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 18px;
}

.state {
  text-align: center;
}

.error {
  background: #ffe2e2;
  border: 1px solid #ffbcbc;
  color: #7a0b0b;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.success {
  background: #e8f5e9;
  border: 1px solid #bde5c8;
  color: #1b5e20;
  padding: 10px 12px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 18px;
}

.col label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 14px;
}

input,
select,
textarea {
  background: #d9f0ff;
  border: 1px solid #9ccfff;
  border-radius: 6px;
  padding: 8px 10px;
  outline: none;
  font-size: 12px;
}

textarea {
  min-height: 140px;
  resize: none;
}

.writer-create {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.preview {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.preview img {
  width: 120px;
  height: 170px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 10px;
}

.btn-cancel {
  background: transparent;
  border: none;
  color: #222;
  font-weight: 600;
  cursor: pointer;
}

.btn-submit {
  background: #4caf50;
  border: none;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .actions {
    justify-content: space-between;
  }
}
</style>
