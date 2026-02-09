import Book from '#models/book'
import Comment from '#models/comment'
import Evaluate from '#models/evaluate'
import type { HttpContext } from '@adonisjs/core/http'

export default class BooksController {
  /**
   * Page Gestion des livres (Maquette 1)
   * Liste les livres triés par date d'ajout avec miniature [cite: 51, 52]
   */
  async index({ response }: HttpContext) {
    const books = await Book.query()
      .orderBy('createdAt', 'desc') // Tri obligatoire par date d'ajout 
      .preload('writer')
      .preload('category')

    return response.ok(books)
  }

  /**
   * Page Liseuse (Maquette 3)
   * Récupère un livre spécifique avec son contenu binaire epub [cite: 43, 45]
   */
  async show({ params, response }: HttpContext) {
    const book = await Book.query()
      .where('id', params.id)
      .preload('writer')
      .preload('category')
      .firstOrFail()

    return response.ok(book)
  }

  /**
   * Sauvegarde d'un nouveau livre (Adapté au format binaire)
   * Stocke le contenu epub et les informations de base [cite: 44]
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    // On récupère les champs nécessaires au nouveau projet [cite: 44]
    const data = request.only([
      'title',
      'author',
      'category_id'
    ])

    // Note : Le contenu binaire epub_file est actuellement géré par le Seeder [cite: 57]
    const book = await Book.create({
      ...data,
      userId: user.id,
    })

    return response.created(book)
  }

  /**
   * Mise à jour d'un livre
   */
  async update({ params, request, response }: HttpContext) {
    const book = await Book.findOrFail(params.id)
    
    // Mise à jour simplifiée pour correspondre au nouveau schéma
    const data = request.only([
      'title',
      'author',
      'category_id',
    ])

    book.merge(data)
    await book.save()
    return response.ok(book)
  }

  /**
   * Suppression d'un livre
   */
  async destroy({ params, response }: HttpContext) {
    const book = await Book.findOrFail(params.id)
    await book.delete()
    return response.ok({ message: 'Livre supprimé avec succès.' })
  }

  /**
   * Filtre les livres par catégorie
   */
  async booksPerCategory({ params, response }: HttpContext) {
    const books = await Book.query()
      .where('category_id', params.category_id)
      .preload('writer')
      .preload('category')
      .orderBy('createdAt', 'desc')

    return response.ok(books)
  }

  /**
   * Récupère les avis (notes et commentaires) pour un livre
   */
  public async getReviewsByBook({ params, response }: HttpContext) {
    const bookId = params.id

    try {
      const evaluates = await Evaluate.query().where('book_id', bookId)
      const comments = await Comment.query().where('book_id', bookId)

      // Fusion par userId
      const merged = evaluates.map((evaluate) => {
        const comment = comments.find((c) => c.userId === evaluate.userId)
        return {
          userId: evaluate.userId,
          rating: evaluate.note,
          comment: comment?.comment || null,
        }
      })

      return response.ok(merged)
    } catch (error) {
      return response.internalServerError({
        message: 'Erreur serveur lors de la récupération des avis',
        error: error.message,
      })
    }
  }

  /**
   * Méthode pour la page d'accueil (Top 5 des ajouts récents)
   */
  async home({ response }: HttpContext) {
    const books = await Book.query()
      .orderBy('createdAt', 'desc')
      .limit(5)
      .preload('writer')
      .preload('category')

    return response.ok(books)
  }
}