import Comment from '#models/comment'
import Evaluate from '#models/evaluate'
import type { HttpContext } from '@adonisjs/core/http'

export default class EvaluatesController {
  /**
   * Display a list of resource
   */
 async index({ params, response }: HttpContext) {
  const evaluates = await Evaluate.query()
    .where('book_id', params.id)   
    .preload('user')               

  return response.ok(evaluates)
}
async AvgRating({ params, response }: HttpContext) {
  const evaluates = await Evaluate.query()
    .where('book_id', params.id)

  const averageRating = evaluates.length > 0
    ? evaluates.reduce((sum, e) => sum + e.note, 0) / evaluates.length
    : 0

  return response.ok({
    averageRating,
    evaluates,
  })
}
  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  public async store({ request, auth, response }: HttpContext) {
    // Récupérer les données envoyées
    const data = request.only(['book_id', 'rating', 'comment'])
    const bookId = data.book_id ?? request.input('bookId')
    const rating = data.rating

    // Vérifier que l'utilisateur est authentifié
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour commenter.' })
    }
    if (bookId === undefined || bookId === null) {
      return response.badRequest({ message: 'book_id est requis.' })
    }
    if (rating === undefined || rating === null) {
      return response.badRequest({ message: 'rating est requis.' })
    }

    const existingEvaluate = await Evaluate.query()
      .where('user_id', user.id)
      .where('book_id', bookId)
      .first()

    if (existingEvaluate) {
      await Evaluate.query()
        .where('user_id', user.id)
        .where('book_id', bookId)
        .update({ note: rating, comment: data.comment ?? '' })
    } else {
      await Evaluate.create({
        userId: user.id,
        bookId,
        note: rating,
        comment: data.comment ?? '',
      })
    }

    const existingComment = await Comment.query()
      .where('user_id', user.id)
      .where('book_id', bookId)
      .first()

    if (existingComment) {
      await Comment.query()
        .where('user_id', user.id)
        .where('book_id', bookId)
        .update({ comment: data.comment ?? '' })
    } else {
      await Comment.create({
        userId: user.id,
        bookId,
        comment: data.comment ?? '',
      })
    }

    const evaluate = await Evaluate.query()
      .where('user_id', user.id)
      .where('book_id', bookId)
      .preload('user')
      .firstOrFail()

    return response.created({
      evaluateId: evaluate.id,
      userId: evaluate.userId,
      username: evaluate.user?.username ?? null,
      rating: evaluate.note,
      comment: evaluate.comment ?? null,
    })
  }
  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    const evaluate = await Evaluate.query()
      .preload('book')
      .preload('user')
      .where('book_id', params.id)
      .firstOrFail()
      
      return await evaluate
  }
  public async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour modifier un commentaire.' })
    }

    const data = request.only(['rating', 'comment', 'book_id'])
    const bookId = data.book_id ?? params.id
    if (bookId === undefined || bookId === null) {
      return response.badRequest({ message: 'book_id est requis.' })
    }

    const existingEvaluate = await Evaluate.query()
      .where('user_id', user.id)
      .where('book_id', bookId)
      .first()
    if (!existingEvaluate) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    // Mettre à jour le commentaire
    const updatePayload: { note?: number; comment?: string } = {}
    if (data.rating !== undefined) {
      updatePayload.note = data.rating
    }
    if (data.comment !== undefined) {
      updatePayload.comment = data.comment ?? ''
    }

    if (Object.keys(updatePayload).length > 0) {
      await Evaluate.query()
        .where('user_id', user.id)
        .where('book_id', bookId)
        .update(updatePayload)
    }

    if (data.comment !== undefined) {
      const existingComment = await Comment.query()
        .where('user_id', user.id)
        .where('book_id', bookId)
        .first()
      if (existingComment) {
        await Comment.query()
          .where('user_id', user.id)
          .where('book_id', bookId)
          .update({ comment: data.comment ?? '' })
      } else {
        await Comment.create({
          userId: user.id,
          bookId,
          comment: data.comment ?? '',
        })
      }
    }

    const evaluate = await Evaluate.query()
      .where('user_id', user.id)
      .where('book_id', bookId)
      .preload('user')
      .firstOrFail()

    return response.ok({
      evaluateId: evaluate.id,
      userId: evaluate.userId,
      username: evaluate.user?.username ?? null,
      rating: evaluate.note,
      comment: evaluate.comment ?? null,
    })
  }

  public async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour supprimer un commentaire.' })
    }

    // Chercher le commentaire
    const note = await Evaluate.find(params.id)
    if (!note) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    // Vérifier que le commentaire appartient à l'utilisateur
    if (note.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez supprimer que vos propres commentaires.' })
    }

    // Supprimer le commentaire
    await note.delete()
    return response.noContent()
  }



}
