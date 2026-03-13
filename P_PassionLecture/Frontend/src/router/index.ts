import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public ──────────────────────────────────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/categoriesView.vue'),
    },

    // ── Livres ───────────────────────────────────────────────────────────────
    {
      // Doit être AVANT /books/:id pour que /books/search ne soit pas capturé
      path: '/books/search',
      name: 'search',
      component: () => import('../views/BooksView.vue'),
    },
    {
      path: '/books/:id',
      name: 'book',
      component: () => import('../views/BookView.vue'),
    },
    {
      // Page liseuse (lire le contenu de l'epub)
      path: '/books/:id/read',
      name: 'reader',
      component: () => import('../views/ReaderView.vue'),
    },

    // ── Protégées (utilisateur connecté) ─────────────────────────────────────
    {
      path: '/catalogue',
      name: 'catalogue',
      component: () => import('../views/catalogueView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/addbook',
      name: 'addbook',
      component: () => import('../views/AddBookView.vue'),
      meta: { requiresAuth: true },
    },
    {
      // Route de modification d'un livre
      path: '/books/edit/:id',
      name: 'edit',
      component: () => import('../views/EditBook.vue'),
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// ── Navigation guard ─────────────────────────────────────────────────────────
router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'login' }
    }
  }
})

export default router
