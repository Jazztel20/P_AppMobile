<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Book } from '@/api/books'
import { booksRatingAvg } from '@/api/books'

const props = defineProps<{ book: Book; showActions?: boolean }>()

const averageRating = ref(0)

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
      <router-link :to="`/books/${book.id}/editBook`" title="Modifier" class="action-btn">
        ⚙️
      </router-link>

      <router-link :to="`/books/${book.id}/deleteBook`" title="Supprimer" class="action-btn delete">
        🗑️
      </router-link>
    </div>

    <!-- Image -->
    <img
      :src="book.image_path || 'https://via.placeholder.com/170x240?text=No+Image'"
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
</style>
