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
        note: 5.0,
        bookId: books[0].id, // Le Petit Prince
        userId: users[0].id, // jean_dupont
        comment: null,
      },
      {
        note: 1.5,
        bookId: books[1].id, // 1984
        userId: users[2].id, // marie_martin
        comment:
          "Big Brother m'a bloqué sur Instagram après avoir lu ce livre. Coïncidence ? Je ne pense pas.",
      },
      {
        note: 3.5,
        bookId: books[2].id, // L'Étranger
        userId: users[3].id, // paul_bernard
        comment:
          "J'ai lu ce livre à la plage et maintenant je suis existentialiste. Merci Camus, super les vacances.",
      },
      {
        note: 0.5,
        bookId: books[3].id, // Harry Potter
        userId: users[4].id, // sophie_dubois
        comment:
          "J'ai essayé d'aller à Poudlard mais apparemment le quai 9 3/4 n'existe pas. J'exige un remboursement.",
      },
      {
        note: 2.5,
        bookId: books[4].id, // Le Seigneur des Anneaux
        userId: users[1].id, // jean_dupont (même user que users[0] ? ici users[1] pour varier)
        comment:
          'Trop long. Ils auraient pu prendre un Uber pour aller au Mordor et économiser 1000 pages.',
      },
      {
        note: 4.5,
        bookId: books[5].id, // Sapiens
        userId: users[2].id, // marie_martin
        comment:
          "Depuis que j'ai lu ce livre, je me sens supérieur aux chimpanzés. Mon chat n'est pas impressionné.",
      },
      {
        note: 3.0,
        bookId: books[0].id, // Le Petit Prince
        userId: users[3].id, // paul_bernard
        comment:
          'Plot twist : le petit prince est en fait un influenceur intergalactique. Personne ne parle de ça.',
      },
      {
        note: 1.0,
        bookId: books[1].id, // 1984
        userId: users[4].id, // sophie_dubois
        comment:
          "Ce livre m'a tellement stressé que j'ai mangé mon téléphone. Maintenant je vis off-grid dans une forêt.",
      },
      {
        note: 4.0,
        bookId: books[2].id, // L'Étranger
        userId: users[1].id, // jean_dupont
        comment:
          'Meursault aurait pu éviter tout ce drame avec une bonne paire de lunettes de soleil et de la crème solaire.',
      },
      {
        note: 2.0,
        bookId: books[3].id, // Harry Potter
        userId: users[2].id, // marie_martin
        comment:
          "J'ai passé 3 heures à attendre ma lettre de Poudlard. Le facteur m'a dit d'arrêter de boire du café.",
      },
      {
        note: 1.0,
        bookId: books[4].id, // Le Seigneur des Anneaux
        userId: users[3].id, // paul_bernard
        comment:
          'Frodon marche pendant 3 tomes alors que les aigles existent. QI de 200 ce hobbit.',
      },
      {
        note: 5.0,
        bookId: books[5].id, // Sapiens
        userId: users[4].id, // sophie_dubois
        comment:
          "J'ai appris qu'on descend tous du même poisson. Maintenant je fais des excuses à mes sushis avant de les manger.",
      },
      {
        note: 0.0,
        bookId: books[0].id, // Le Petit Prince
        userId: users[2].id, // marie_martin
        comment:
          "Le renard dit que l'essentiel est invisible. Du coup j'ai arrêté de payer mes impôts. Ils sont invisibles maintenant.",
      },
      {
        note: 3.0,
        bookId: books[1].id, // 1984
        userId: users[3].id, // paul_bernard
        comment:
          'Winston devrait créer une chaîne YouTube "Big Brother Exposed". Ça marcherait en 2025.',
      },
      {
        note: 2.0,
        bookId: books[4].id, // Le Seigneur des Anneaux
        userId: users[4].id, // sophie_dubois
        comment:
          "Tolkien a inventé trois langues elfiques mais n'a jamais expliqué où ils font caca. Grosse lacune narrative.",
      },
    ])
  }
}
