import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator, loginValidator } from '#validators/auth'
import User from '#models/user'
export default class AuthController {
  /**
   * Crée
   */
  async login({ request, response }: HttpContext) {
    const { username, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(username, password)
    const token = await User.accessTokens.create(user)
    return response.ok({
      token: token,
      ...user.serialize(),
    })
  }
  /**
   * Enregistre un utilisateur
   */
  async register({ request, response }: HttpContext) {
    // Validation des données utilisateurs
    const payload = await request.validateUsing(registerValidator)
    // Création de l'utilisateur
    const user = await User.create(payload)
    // Retourne les données utilisateur
    const token = await User.accessTokens.create(user)

    return response.created({
      token: token,
      ...user.serialize(),
    })
  }
  /**
   * Supprime le token OAT de l'utilisateur connecté
   */
  async logout({ auth, response }: HttpContext) {
    // Récupère l'utilisateur connecté/authentifié
    const user = auth.getUserOrFail()
    // Récupère le token de l'utilisateur connecté
    const token = auth.user?.currentAccessToken.identifier
    // Si le token n'existe pas, retourne une erreur HTTP 400
    if (!token) {
      return response.badRequest({ message: 'Token not found' })
    }
    // Supprime le token
    await User.accessTokens.delete(user, token)
    // Confirme à l'utilisateur que le logout est un succès
    return response.ok({ message: 'Logged out' })
  }
}
