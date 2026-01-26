import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Evaluate from '#models/evaluate'
import Book from '#models/book'
import User from '#models/user'

export default class extends BaseSeeder {
  public async run() {
    const users = await User.all()
    const books = await Book.all()

    await Evaluate.createMany([
      {
        note: 5,
        bookId: books[0].id, // Le Petit Prince
        userId: users[0].id  // jean_dupont
      },
      {
        note: 1,
        bookId: books[1].id, // 1984
        userId: users[2].id  // marie_martin
      },
      {
        note: 3,
        bookId: books[2].id, // L'Étranger
        userId: users[3].id  // paul_bernard
      },
      {
        note: 0,
        bookId: books[3].id, // Harry Potter
        userId: users[4].id  // sophie_dubois
      },
      {
        note: 2,
        bookId: books[4].id, // Le Seigneur des Anneaux
        userId: users[1].id  // jean_dupont (même user que users[0] ? ici users[1] pour varier)
      },
      {
        note: 4,
        bookId: books[5].id, // Sapiens
        userId: users[2].id  // marie_martin
      },
      {
        note: 3,
        bookId: books[0].id, // Le Petit Prince
        userId: users[3].id  // paul_bernard
      },
      {
        note: 1,
        bookId: books[1].id, // 1984
        userId: users[4].id  // sophie_dubois
      },
      {
        note: 4,
        bookId: books[2].id, // L'Étranger
        userId: users[1].id  // jean_dupont
      },
      {
        note: 2,
        bookId: books[3].id, // Harry Potter
        userId: users[2].id  // marie_martin
      },
      {
        note: 1,
        bookId: books[4].id, // Le Seigneur des Anneaux
        userId: users[3].id  // paul_bernard
      },
      {
        note: 5,
        bookId: books[5].id, // Sapiens
        userId: users[4].id  // sophie_dubois
      },
      {
        note: 0,
        bookId: books[0].id, // Le Petit Prince
        userId: users[2].id  // marie_martin
      },
      {
        note: 3,
        bookId: books[1].id, // 1984
        userId: users[3].id  // paul_bernard
      },
      {
        note: 2,
        bookId: books[4].id, // Le Seigneur des Anneaux
        userId: users[4].id  // sophie_dubois
      }
    ])
  }
}
