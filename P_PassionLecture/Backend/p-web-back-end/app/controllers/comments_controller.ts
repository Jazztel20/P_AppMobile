import Comment from '#models/comment'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  /**
   * Liste les commentaires d'un livre
   * Route: GET /books/:id/comments
   */
  async index({ params, response }: HttpContext) {
    const comments = await Comment.query()
      .where('book_id', params.id)
      .preload('user')
      .orderBy('createdAt', 'desc')

    return response.ok(comments)
  }

  /**
   * Poster un commentaire sur un livre (utilisateur connecté)
   * Body: { book_id: number, content: string }
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour commenter.' })
    }

    const data = request.only(['book_id', 'content'])

    if (!data.book_id) {
      return response.badRequest({ message: 'book_id est requis.' })
    }
    if (!data.content?.trim()) {
      return response.badRequest({ message: 'Le commentaire ne peut pas être vide.' })
    }

    const comment = await Comment.create({
      userId: user.id,
      bookId: data.book_id,
      comment: data.content.trim(),
    })

    return response.created(comment)
  }

  /**
   * Modifier un commentaire (propriétaire uniquement)
   * Body: { content: string }
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour modifier un commentaire.' })
    }

    const comment = await Comment.find(params.id)
    if (!comment) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    if (comment.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez modifier que vos propres commentaires.' })
    }

    const { content } = request.only(['content'])
    if (content?.trim()) {
      comment.comment = content.trim()
    }
    await comment.save()

    return response.ok(comment)
  }

  /**
   * Supprimer un commentaire (propriétaire uniquement)
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour supprimer un commentaire.' })
    }

    const comment = await Comment.find(params.id)
    if (!comment) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    if (comment.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez supprimer que vos propres commentaires.' })
    }

    await comment.delete()
    return response.noContent()
  }
}