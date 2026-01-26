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
    const data = request.only(['book_id', 'content'])

    // Vérifier que l'utilisateur est authentifié
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour commenter.' })
    }

    // Créer le commentaire en liant l'utilisateur
    const comment = await Evaluate.create({
      userId: user.id,
      bookId: data.book_id,
      note: data.content,
    })

    return response.created(comment)
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

    // Chercher le commentaire
    const note = await Evaluate.find(params.id)
    if (!note) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    // Vérifier que le commentaire appartient à l'utilisateur
    if (note.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez modifier que vos propres commentaires.' })
    }

    // Mettre à jour le commentaire
    const data = request.only(['content'])
    note.note = data.content
    await note.save()

    return response.ok(note)
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