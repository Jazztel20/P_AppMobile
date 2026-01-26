import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    await Category.createMany([
      { label: 'Fiction' },
      { label: 'Science-Fiction' },
      { label: 'Fantaisie' },
      { label: 'Histoire' },
      { label: 'Biographie' },
      { label: 'Philosophie' },
      { label: 'Policier' },
      { label: 'Romance' },
      { label: 'Thriller' },
      { label: 'Jeunesse' },
      { label: 'Essai' },
      { label: 'Poésie' },
      { label: 'Théâtre' },
      { label: 'Développement Personnel' },
      { label: 'Science' },
    ])
  }
}
