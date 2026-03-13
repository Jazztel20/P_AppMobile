import Evaluate from '#models/evaluate'
import type { HttpContext } from '@adonisjs/core/http'

export default class EvaluatesController {
  /**
   * Liste les évaluations d'un livre
   * Route: GET /books/:id/evaluates
   */
  async index({ params, response }: HttpContext) {
    const evaluates = await Evaluate.query()
      .where('book_id', params.id)
      .preload('user')

    return response.ok(evaluates)
  }

  /**
   * Calcule la note moyenne d'un livre
   * Route: GET /books/:id/AvgRating
   */
  async AvgRating({ params, response }: HttpContext) {
    const evaluates = await Evaluate.query().where('book_id', params.id)

    const averageRating =
      evaluates.length > 0
        ? evaluates.reduce((sum, e) => sum + e.note, 0) / evaluates.length
        : 0

    return response.ok({ averageRating, evaluates })
  }

  /**
   * Poster une note pour un livre (utilisateur connecté)
   * Body: { book_id: number, content: number (1-5) }
   */
  async store({ request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour noter.' })
    }

    const data = request.only(['book_id', 'content'])
    const note = Number(data.content)

    if (!data.book_id) {
      return response.badRequest({ message: 'book_id est requis.' })
    }
    if (isNaN(note) || note < 0 || note > 5) {
      return response.badRequest({ message: 'La note doit être un nombre entre 0 et 5.' })
    }

    // Upsert: un utilisateur peut mettre à jour sa note existante
    const existing = await Evaluate.query()
      .where('book_id', data.book_id)
      .where('user_id', user.id)
      .first()

    if (existing) {
      existing.note = note
      await existing.save()
      return response.ok(existing)
    }

    const evaluate = await Evaluate.create({
      userId: user.id,
      bookId: data.book_id,
      note,
    })

    return response.created(evaluate)
  }

  /**
   * Modifier une évaluation (propriétaire uniquement)
   * Body: { content: number }
   */
  async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour modifier une note.' })
    }

    const evaluate = await Evaluate.find(params.id)
    if (!evaluate) {
      return response.notFound({ message: 'Évaluation non trouvée.' })
    }

    if (evaluate.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez modifier que vos propres notes.' })
    }

    const { content } = request.only(['content'])
    const note = Number(content)
    if (!isNaN(note) && note >= 0 && note <= 5) {
      evaluate.note = note
    }
    await evaluate.save()

    return response.ok(evaluate)
  }

  /**
   * Supprimer une évaluation (propriétaire uniquement)
   */
  async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour supprimer une note.' })
    }

    const evaluate = await Evaluate.find(params.id)
    if (!evaluate) {
      return response.notFound({ message: 'Évaluation non trouvée.' })
    }

    if (evaluate.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez supprimer que vos propres notes.' })
    }

    await evaluate.delete()
    return response.noContent()
  }
}