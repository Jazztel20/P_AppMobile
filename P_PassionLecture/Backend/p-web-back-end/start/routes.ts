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

router
  .group(() => {
    router.get('books', [BooksController, 'booksPerCategory'])
  })
  .prefix('categories/:category_id')
router.group(() => {
  router.resource('writers', WritersController).apiOnly()

  router.resource('users', UsersController).apiOnly()

  router.resource('categories', CategoriesController).apiOnly()

  //Page Home | 5 Livres Affichés
  router.get('/books/home', [BooksController, 'home'])

  router.get('books', [BooksController, 'index'])

  router.get('books/:id', [BooksController, 'show'])

  router.get('books/:id/Rewiews', [BooksController, 'getReviewsByBook'])

  router.get('books/:id/AvgRating',[EvaluatesController, 'AvgRating'])
// salut theo
  //router.get('books/:id/comments', [CommentsController, 'index'])

  //router.get('books/:id/evaluates', [EvaluatesController, 'index'])
})

//Données affichées seulement pour les utilisateurs connectés
router
  .group(() => {
    router.post('/comments', [CommentsController, 'store'])
    router.post('/evaluates', [EvaluatesController, 'store'])
    router.put('/comments/:id', [CommentsController, 'update'])
    router.put('/evaluates/:id', [EvaluatesController, 'update'])
    router.delete('/comments/:id', [CommentsController, 'destroy'])
    router.delete('/evaluates/:id', [EvaluatesController, 'destroy'])
    router.post('/books', [BooksController, 'store'])
    router.put('/books/:id', [BooksController, 'update'])
    router.delete('/books/:id', [BooksController, 'destroy'])
  })
  .use(middleware.auth())

//Utilisateur
router
  .group(() => {
    router.post('register', [AuthController, 'register'])
    router.post('login', [AuthController, 'login'])
    router.post('logout', [AuthController, 'logout']).use(middleware.auth())
  })
  .prefix('user')
