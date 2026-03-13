import Writer from '#models/writer'
import type { HttpContext } from '@adonisjs/core/http'

export default class WritersController {
  /**
   * Display a list of resource
   */
  async index({}: HttpContext) {
    return await Writer.all()
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['firstname', 'lastname'])

    if (!data.firstname || !data.lastname) {
      return response.badRequest({ message: 'firstname et lastname sont requis' })
    }

    const writer = await Writer.create(data)
    return response.created(writer)
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {
    return await Writer.findOrFail(params.id)
  }

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({}: HttpContext) {}

  /**
   * Delete record
   */
  async destroy({}: HttpContext) {}
}
