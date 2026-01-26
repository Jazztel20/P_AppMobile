<script lang="ts" setup>
import type { Book } from '@/models/book'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchBook, updateBook } from '@/api/books'

const route = useRoute()
const router = useRouter()

const bookId = Number(route.params.id)

const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Livre original (optionnel, utile pour comparaison / reset)
const book = ref<Book | null>(null)

// État du formulaire (copie modifiable)
const form = reactive<Book>({
  id: bookId,
  title: '',
  numberOfPages: 0,
  pdfLink: '',
  abstract: '',
  editor: '',
  editionYear: '',
  category: { name: '' } as any,
  writer: { name: '' } as any,
} as Book)

function hydrateForm(b: Book) {
  // évite les crashs si certains sous-objets sont absents
  const safe = {
    ...b,
    category: b.category ?? { name: '' },
    writer: b.writer ?? { name: '' },
  }

  // copie dans reactive(form)
  Object.assign(form, safe)
}

async function loadBook() {
  loading.value = true
  error.value = null
  success.value = null

  try {
    const data = await fetchBook(bookId)
    book.value = data
    hydrateForm(data)
  } catch (e: any) {
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

  saving.value = true
  error.value = null
  success.value = null

  try {
    // Payload : ici je renvoie l'objet form complet.
    // Si ton API attend seulement certains champs, construis un payload minimal.
    const updated = await updateBook(bookId, form)

    book.value = updated
    hydrateForm(updated)

    success.value = 'Livre mis à jour.'
    // optionnel : rediriger après succès
    // router.push({ name: 'book', params: { id: bookId } })
  } catch (e: any) {
    error.value = e?.message ?? 'Failed to update book'
  } finally {
    saving.value = false
  }
}

onMounted(loadBook)
</script>

<template>
  <div v-if="loading">Chargement...</div>
  <div v-else>
    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="success" style="color: green">{{ success }}</p>

    <div class="grid-parent">
      <div class="grid-child">
        <form @submit.prevent="onSubmit">
          <label for="titre">Titre</label><br />
          <input type="text" id="titre" v-model="form.title" />

          <label for="categorie">Catégorie</label><br />
          <input type="text" id="categorie" v-model="form.category.name" />

          <label for="pages">Nombre de pages</label><br />
          <input type="number" id="pages" v-model.number="form.numberOfPages" />

          <label for="extrait">Extrait</label><br />
          <input type="text" id="extrait" v-model="form.pdfLink" />

          <label for="resume">Résumé</label><br />
          <textarea id="resume" v-model="form.abstract"></textarea>

          <label for="auteur">Auteur</label><br />
          <input type="text" id="auteur" v-model="form.writer.name" />

          <label for="editeur">Éditeur</label><br />
          <input type="text" id="editeur" v-model="form.editor" />

          <label for="date_publication">Date de publication</label><br />
          <input type="date" id="date_publication" v-model="form.editionYear" />

          <button type="submit" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Submit' }}
          </button>

          <button type="button" @click="loadBook" :disabled="saving">Réinitialiser</button>

          <button type="button" @click="router.back()" :disabled="saving">Retour</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
