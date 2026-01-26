<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import BookCard from '@/components/bookcard/BookCard.vue'

const router = useRouter()

// ------------------------------
// Reactivity
// ------------------------------
const categories = ref([])
const books = ref([])
const selectedCategory = ref('')

// ------------------------------
// Fetch categories on page load
// ------------------------------
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3333/categories')
    categories.value = res.data
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
})

// ------------------------------
// Load books for the clicked category
// ------------------------------
async function goToCategory(cat) {
  selectedCategory.value = cat.label

  try {
    const res = await axios.get(`http://localhost:3333/categories/${cat.id}/books`)

    // Map backend → frontend format for BookCard.vue
    books.value = res.data.map((book) => ({
      id: book.id,
      title: book.title,
      image: book.imagePath, // adapt backend field
      rating: 0, // backend has no rating, set a default
    }))
  } catch (err) {
    console.error('Failed to load books:', err)
  }
}
</script>

<template>
  <div class="page-body">
    <div class="page-wrapper">
      <div class="layout">
        <!-- ---------------------------------------
             LEFT CATEGORY COLUMN
        ---------------------------------------- -->
        <aside class="category-column">
          <h2>Catégories</h2>

          <div class="category-list">
            <div
              class="category-item"
              v-for="cat in categories"
              :key="cat.id"
              @click="goToCategory(cat)"
            >
              {{ cat.label }}
            </div>
          </div>
        </aside>

        <!-- ---------------------------------------
             BOOKS SECTION
        ---------------------------------------- -->
        <section class="books-section">
          <h2>{{ selectedCategory }}</h2>

          <div class="book-cards">
            <BookCard v-for="book in books" :key="book.id" :book="book" :showActions="false" />
          </div>
        </section>
      </div>
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

/* PAGE WRAPPER */
.page-body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.page-wrapper {
  width: 90%;
  max-width: 1300px;
}

/* MAIN LAYOUT */
.layout {
  display: flex;
  gap: 20px;
}

/* LEFT COLUMN */
.category-column {
  width: 250px;
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}

.category-column h2 {
  margin-bottom: 15px;
  color: #333;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  padding: 12px;
  background: #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  text-align: center;
  transition: 0.3s;
  color: #555;
}

.category-item:hover {
  background: #ccc;
}

/* BOOKS SECTION */
.books-section {
  flex: 1;
  background: #ffffff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.books-section h2 {
  margin-bottom: 20px;
  border-bottom: 3px solid #0172c5;
  padding-bottom: 8px;
}

/* CARD GRID */
.book-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 30px; /* more spacing between cards */
  padding-top: 10px;
}
</style>
