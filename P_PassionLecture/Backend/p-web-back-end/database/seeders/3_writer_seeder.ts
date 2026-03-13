import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Writer from '#models/writer'

export default class extends BaseSeeder {
  async run() {
    await Writer.createMany([
      {
        firstname: 'Antoine',
        lastname: 'de Saint-Exupéry',
      },
      {
        firstname: 'George',
        lastname: 'Orwell',
      },
      {
        firstname: 'Albert',
        lastname: 'Camus',
      },
      {
        firstname: 'J.K.',
        lastname: 'Rowling',
      },
      {
        firstname: 'J.R.R.',
        lastname: 'Tolkien',
      },
      {
        firstname: 'Yuval Noah',
        lastname: 'Harari',
      },
      {
        firstname: 'Victor',
        lastname: 'Hugo',
      },
      {
        firstname: 'Émile',
        lastname: 'Zola',
      },
      {
        firstname: 'Agatha',
        lastname: 'Christie',
      },
      {
        firstname: 'Stephen',
        lastname: 'King',
      },
      {
        firstname: 'Isaac',
        lastname: 'Asimov',
      },
      {
        firstname: 'Gabriel',
        lastname: 'García Márquez',
      },
      {
        firstname: 'Haruki',
        lastname: 'Murakami',
      },
      {
        firstname: 'Marguerite',
        lastname: 'Yourcenar',
      },
      {
        firstname: 'Simone',
        lastname: 'de Beauvoir',
      },
      { firstname: 'Karl', lastname: 'Marx' },
      { firstname: 'Friedrich', lastname: 'Engels' },
      { firstname: 'Fidel', lastname: 'Castro' },
      { firstname: 'Daniele', lastname: 'Ganser' },
      { firstname: 'Machiavelli', lastname: 'Niccolò' },
      { firstname: 'Sun', lastname: 'Tzu' },
      { firstname: 'Anonymous', lastname: 'Collectif' },
    ])
  }
}
