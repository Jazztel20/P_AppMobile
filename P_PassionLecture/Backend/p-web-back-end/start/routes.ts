/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import CategoriesController from '#controllers/categories_controller'
import UsersController from '#controllers/users_controller'
import WritersController from '#controllers/writers_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import BooksController from '#controllers/books_controller'
import CommentsController from '#controllers/comments_controller'
import EvaluatesController from '#controllers/evaluates_controller'
import AuthController from '#controllers/auth_controller'
import TagsController from '#controllers/tags_controller'

// ─── Routes publiques : livres par catégorie ────────────────────────────────
router
  .group(() => {
    router.get('books', [BooksController, 'booksPerCategory'])
  })
  .prefix('categories/:category_id')

// ─── Routes publiques ───────────────────────────────────────────────────────
router.group(() => {
  router.resource('writers', WritersController).apiOnly()
  router.resource('users', UsersController).apiOnly()
  router.resource('categories', CategoriesController).apiOnly()

  // Page d'accueil : 5 livres récents
  router.get('/books/home', [BooksController, 'home'])

  // Recherche de livres par titre (?q=...)
  router.get('/books/search', [BooksController, 'search'])

  // Liste tous les livres
  router.get('books', [BooksController, 'index'])

  // Détail d'un livre
  router.get('books/:id', [BooksController, 'show'])

  // EPUB binaire d'un livre (pour la liseuse)
  router.get('books/:id/epub', [BooksController, 'getEpub'])

  // Avis (notes + commentaires fusionnés) d'un livre
  router.get('books/:id/reviews', [BooksController, 'getReviewsByBook'])

  // Note moyenne d'un livre
  router.get('books/:id/AvgRating', [EvaluatesController, 'AvgRating'])

  // Commentaires d'un livre
  router.get('books/:id/comments', [CommentsController, 'index'])

  // Notes (évaluations) d'un livre
  router.get('books/:id/evaluates', [EvaluatesController, 'index'])
})

// ─── Routes protégées (utilisateur connecté) ────────────────────────────────
router
  .group(() => {
    // --- Commentaires ---
    router.post('/comments', [CommentsController, 'store'])
    router.put('/comments/:id', [CommentsController, 'update'])
    router.delete('/comments/:id', [CommentsController, 'destroy'])

    // --- Évaluations (notes) ---
    router.post('/evaluates', [EvaluatesController, 'store'])
    router.put('/evaluates/:id', [EvaluatesController, 'update'])
    router.delete('/evaluates/:id', [EvaluatesController, 'destroy'])

    // --- Livres (CRUD) ---
    router.post('/books', [BooksController, 'store'])
    router.put('/books/:id', [BooksController, 'update'])
    router.delete('/books/:id', [BooksController, 'destroy'])

    // --- Tags ---
    router.get('/tags', [TagsController, 'index'])
    router.post('/tags', [TagsController, 'store'])
    router.put('/tags/:id', [TagsController, 'update'])
    router.delete('/tags/:id', [TagsController, 'destroy'])
    // Attacher / détacher un livre à un tag
    router.post('/tags/:id/books/:bookId', [TagsController, 'attachBook'])
    router.delete('/tags/:id/books/:bookId', [TagsController, 'detachBook'])
  })
  .use(middleware.auth())

// ─── Authentification ────────────────────────────────────────────────────────
router
  .group(() => {
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])
    router.post('logout', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('user')
