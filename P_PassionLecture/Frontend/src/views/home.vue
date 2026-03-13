<script setup lang="ts">
// ---------------------------------------------------
// Imports
// ---------------------------------------------------
import BookCard from '@/components/bookcard/BookCard.vue'
import { ref, onMounted } from 'vue'
import { homePageAPI } from '@/api/books'
import type { Book } from '@/api/books'

const books = ref<Book[]>([])

onMounted(async () => {
  books.value = await homePageAPI() // récupère les livres via l'API
})
</script>

<template>
  <div class="page-body">
    <div class="page-wrapper">
      <!-- -------------------------------------
           INTRO TEXT
      ---------------------------------------- -->
      <section class="intro">
        <p>
          Bienvenue sur Passion Lecture, l’espace dédié à tous ceux qui aiment découvrir, partager
          et échanger autour des livres. Que vous soyez passionné de romans, amateur de mangas ou
          curieux de nouvelles lectures, vous trouverez ici une plateforme ouverte où chacun peut
          présenter ses ouvrages, laisser une appréciation ou consulter les avis de la communauté.
          Plongez dans l’univers des lecteurs et laissez-vous inspirer par les dernières découvertes
          !
        </p>
      </section>

      <!-- ---------------------------------------
           FEATURED BOOKS
      ---------------------------------------- -->
      <section class="books-section">
        <h2 class="section-title">Livres</h2>

        <div class="book-cards">
          <BookCard v-for="book in books" :key="book.id" :book="book" :showActions="false" />
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* GLOBAL RESET */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.page-body {
  font-family: Arial, Helvetica, sans-serif;
  background: #ffffff;
  display: flex;
  justify-content: center;
  padding: 20px;
  margin: 70px 0;
}

.page-wrapper {
  width: 90%;
  max-width: 1300px;
}

/* ---------------------------------------
   INTRO SECTION
---------------------------------------- */
.intro {
  margin-bottom: 25px;
  line-height: 1.5;
  font-size: 14px;
  text-align: justify;
}

/* ---------------------------------------
   BOOK SECTION
---------------------------------------- */
.books-section {
  border-top: 3px solid #0172c5;
  padding-top: 20px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* Grid of BookCard items */
.book-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 25px; /* space between cards */
  margin-top: 10px;
}

/* ---------------------------------------
   RESPONSIVE
---------------------------------------- */
@media (max-width: 800px) {
  .book-cards {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
