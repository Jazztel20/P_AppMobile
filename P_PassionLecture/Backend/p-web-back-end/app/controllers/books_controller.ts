import Book from '#models/book'
import Comment from '#models/comment'
import Evaluate from '#models/evaluate'
import type { HttpContext } from '@adonisjs/core/http'

export default class BooksController {
  /**
   * Page Gestion des livres (Maquette 1)
   * Liste les livres triés par date d'ajout avec miniature
   */
  async index({ response }: HttpContext) {
    const books = await Book.query()
      .orderBy('createdAt', 'desc')
      .preload('writer')
      .preload('category')
      .preload('user')

    return response.ok(books)
  }

  /**
   * Page Liseuse (Maquette 3)
   * Récupère un livre spécifique avec toutes ses infos
   */
  async show({ params, response }: HttpContext) {
    const book = await Book.query()
      .where('id', params.id)
      .preload('writer')
      .preload('category')
      .preload('user')
      .firstOrFail()

    return response.ok(book)
  }

  /**
   * Renvoie le contenu EPUB binaire en base64 pour la liseuse
   */
  async getEpub({ params, response }: HttpContext) {
    const book = await Book.findOrFail(params.id)

    if (!book.epubFile) {
      return response.notFound({ message: 'Fichier EPUB introuvable.' })
    }

    // Retourne le contenu EPUB encodé en base64 pour affichage frontend
    return response.ok({
      id: book.id,
      title: book.title,
      epubBase64: book.epubFile.toString('base64'),
    })
  }

  /**
   * Sauvegarde d'un nouveau livre
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user!

    const data = request.only([
      'title',
      'category_id',
      'number_of_pages',
      'pdf_link',
      'abstract',
      'editor',
      'edition_year',
      'image_path',
      'writer_id',
    ])

    const book = await Book.create({
      title: data.title,
      categoryId: data.category_id ?? null,
      numberOfPages: data.number_of_pages ?? null,
      pdfLink: data.pdf_link ?? null,
      abstract: data.abstract ?? null,
      editor: data.editor ?? null,
      editionYear: data.edition_year ?? null,
      imagePath: data.image_path ?? null,
      writerId: data.writer_id ?? null,
      userId: user.id,
    })

    return response.created(book)
  }

  /**
   * Mise à jour d'un livre
   */
  async update({ params, request, response }: HttpContext) {
    const book = await Book.findOrFail(params.id)

    const data = request.only([
      'title',
      'category_id',
      'number_of_pages',
      'pdf_link',
      'abstract',
      'editor',
      'edition_year',
      'image_path',
      'writer_id',
    ])

    book.merge({
      title: data.title ?? book.title,
      categoryId: data.category_id ?? book.categoryId,
      numberOfPages: data.number_of_pages ?? book.numberOfPages,
      pdfLink: data.pdf_link ?? book.pdfLink,
      abstract: data.abstract ?? book.abstract,
      editor: data.editor ?? book.editor,
      editionYear: data.edition_year ?? book.editionYear,
      imagePath: data.image_path ?? book.imagePath,
      writerId: data.writer_id ?? book.writerId,
    })

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
   * Retourne une liste fusionnant notes + commentaires par userId
   */
  public async getReviewsByBook({ params, response }: HttpContext) {
    const bookId = params.id

    try {
      const evaluates = await Evaluate.query()
        .where('book_id', bookId)
        .preload('user')

      const comments = await Comment.query()
        .where('book_id', bookId)
        .preload('user')

      // Fusion par userId
      const merged = evaluates.map((evaluate) => {
        const comment = comments.find((c) => c.userId === evaluate.userId)
        return {
          userId: evaluate.userId,
          username: (evaluate as any).user?.username ?? null,
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

  /**
   * Recherche de livres par titre
   */
  async search({ request, response }: HttpContext) {
    const q = request.input('q', '')

    const books = await Book.query()
      .where('title', 'like', `%${q}%`)
      .preload('writer')
      .preload('category')
      .orderBy('createdAt', 'desc')
      .limit(50)

    return response.ok(books)
  }
}