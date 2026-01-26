import Comment from '#models/comment'
import type { HttpContext } from '@adonisjs/core/http'

export default class CommentsController {
  /**
   * Display a list of resource
   */
 async index({ params, response }: HttpContext) {
  const evaluates = await Comment.query()
    .where('book_id', params.id)   
    .preload('user')               

  return response.ok(evaluates)
}

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}


  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
  
      const comment = await Comment.query()
      .preload('book')
      .preload('user')
      .where('book_id', params.id)
      .firstOrFail()
  
      return await comment
    }
  public async store({ request, auth, response }: HttpContext) {
    // Récupérer les données envoyées
    const data = request.only(['book_id', 'content'])

    // Vérifier que l'utilisateur est authentifié
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour commenter.' })
    }

    // Créer le commentaire en liant l'utilisateur
    const comment = await Comment.create({
      userId: user.id,
      bookId: data.book_id,
      comment: data.content,
    })

    return response.created(comment)
  }
  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  public async update({ params, request, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour modifier un commentaire.' })
    }

    // Chercher le commentaire
    const comment = await Comment.find(params.id)
    if (!comment) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    // Vérifier que le commentaire appartient à l'utilisateur
    if (comment.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez modifier que vos propres commentaires.' })
    }

    // Mettre à jour le commentaire
    const data = request.only(['content'])
    comment.comment = data.content
    await comment.save()

    return response.ok(comment)
  }

  public async destroy({ params, auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Vous devez être connecté pour supprimer un commentaire.' })
    }

    // Chercher le commentaire
    const comment = await Comment.find(params.id)
    if (!comment) {
      return response.notFound({ message: 'Commentaire non trouvé.' })
    }

    // Vérifier que le commentaire appartient à l'utilisateur
    if (comment.userId !== user.id) {
      return response.forbidden({ message: 'Vous ne pouvez supprimer que vos propres commentaires.' })
    }

    // Supprimer le commentaire
    await comment.delete()
    return response.noContent()
  }
}