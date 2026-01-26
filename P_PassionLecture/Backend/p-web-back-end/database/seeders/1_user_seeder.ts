import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        username: 'admin',
        isAdmin: true,
        password: 'Admin123!'
      },
      {
        username: 'jean_dupont',
        isAdmin: false,
        password: 'Password123!'
      },
      {
        username: 'marie_martin',
        isAdmin: false,
        password: 'Password123!'
      },
      {
        username: 'paul_bernard',
        isAdmin: false,
        password: 'Password123!'
      },
      {
        username: 'sophie_dubois',
        isAdmin: false,
        password: 'Password123!'
      },
      {
        username: 'moderator',
        isAdmin: true,
        password: 'Moderator123!'
      }
    ])
  }
}