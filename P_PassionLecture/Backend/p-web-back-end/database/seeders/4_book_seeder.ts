import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Book from '#models/book'
import Category from '#models/category'
import User from '#models/user'
import Writer from '#models/writer'

export default class extends BaseSeeder {
  async run() {
    const categories = await Category.query().orderBy('id', 'asc')
    const users = await User.query().orderBy('id', 'asc')
    const writers = await Writer.query().orderBy('id', 'asc')

    await Book.createMany([
      {
        title: 'Le Petit Prince',
        numberOfPages: 96,
        pdfLink: 'https://example.com/petit-prince.pdf',
        abstract:
          "Un aviateur, exilé dans le désert du Sahara, rencontre un petit prince venu d'une autre planète.",
        editor: 'Gallimard',
        editionYear: 1943,
        imagePath: '/images/petit-prince.jpg',
        categoryId: categories[0].id, // Fiction
        writerId: writers[1].id,
        userId: users[1].id,
      },
      {
        title: '1984',
        numberOfPages: 328,
        pdfLink: 'https://example.com/1984.pdf',
        abstract:
          'Dans une société totalitaire où Big Brother surveille chaque citoyen, Winston Smith tente de résister.',
        editor: 'Secker & Warburg',
        editionYear: 1949,
        imagePath: '/images/1984.jpg',
        categoryId: categories[1].id, // Science-Fiction
        writerId: writers[1].id, // George Orwell
        userId: users[0].id,
      },
      {
        title: "L'Étranger",
        numberOfPages: 159,
        pdfLink: 'https://example.com/etranger.pdf',
        abstract:
          'Meursault, un employé de bureau à Alger, tue un Arabe et doit affronter la justice.',
        editor: 'Gallimard',
        editionYear: 1942,
        imagePath: '/images/etranger.jpg',
        categoryId: categories[0].id, // Fiction
        writerId: writers[2].id, // Albert Camus
        userId: users[1].id,
      },
      {
        title: "Harry Potter à l'école des sorciers",
        numberOfPages: 320,
        pdfLink: 'https://example.com/harry-potter-1.pdf',
        abstract:
          "Harry Potter découvre qu'il est un sorcier et entre à l'école de magie Poudlard.",
        editor: 'Gallimard Jeunesse',
        editionYear: 1997,
        imagePath: '/images/harry-potter-1.jpg',
        categoryId: categories[2].id, // Fantasy
        writerId: writers[3].id, // J.K. Rowling
        userId: users[1].id,
      },
      {
        title: 'Le Seigneur des Anneaux',
        numberOfPages: 1216,
        pdfLink: 'https://example.com/lotr.pdf',
        abstract:
          'Frodon Sacquet doit détruire un anneau maléfique pour sauver la Terre du Milieu.',
        editor: 'Allen & Unwin',
        editionYear: 1954,
        imagePath: '/images/lotr.jpg',
        categoryId: categories[2].id, // Fantasy
        writerId: writers[4].id, // J.R.R. Tolkien
        userId: users[0].id,
      },
      {
        title: "Sapiens: Une brève histoire de l'humanité",
        numberOfPages: 512,
        pdfLink: 'https://example.com/sapiens.pdf',
        abstract:
          "Une exploration fascinante de l'histoire de l'espèce humaine depuis ses origines.",
        editor: 'Albin Michel',
        editionYear: 2011,
        imagePath: '/images/sapiens.jpg',
        categoryId: categories[3].id, // Histoire
        writerId: writers[5].id, // Yuval Noah Harari
        userId: users[0].id,
      },
      {
        title: "L'Étranger",
        numberOfPages: 159,
        pdfLink: 'https://example.com/etranger.pdf',
        abstract:
          'Meursault traverse l’absurdité de la vie moderne et fait face aux conséquences d’un acte irrationnel.',
        editor: 'Gallimard',
        editionYear: 1942,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[0].id, // Fiction
        writerId: writers[2].id, // Albert Camus
        userId: users[0].id,
      },
      {
        title: 'The Communist Manifesto',
        numberOfPages: 48,
        pdfLink: 'https://example.com/communist-manifesto.pdf',
        abstract:
          'Introduction fondamentale au matérialisme historique et à la critique du capitalisme.',
        editor: 'Penguin Classics',
        editionYear: 1848,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[10].id, // Essai
        writerId: writers[15].id, // Karl Marx
        userId: users[1].id,
      },
      {
        title: 'Fidel Castro: My Life',
        numberOfPages: 752,
        pdfLink: 'https://example.com/castro.pdf',
        abstract:
          'Autobiographie détaillée du leader cubain retraçant révolution, politique et idéologie.',
        editor: 'Scribner',
        editionYear: 2006,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[4].id, // Biographie
        writerId: writers[17].id, // Fidel Castro
        userId: users[0].id,
      },
      {
        title: 'Operation Gladio',
        numberOfPages: 320,
        pdfLink: 'https://example.com/gladio.pdf',
        abstract: 'Enquête sur les réseaux clandestins stay-behind opérés durant la guerre froide.',
        editor: 'Verso Books',
        editionYear: 1990,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[3].id, // Histoire
        writerId: writers[18].id, // Daniele Ganser
        userId: users[1].id,
      },
      {
        title: 'Astérion et le Minotaure',
        numberOfPages: 240,
        pdfLink: 'https://example.com/asterion.pdf',
        abstract: 'Réinterprétation moderne du mythe crétois d’Astérion et du Minotaure.',
        editor: 'Flammarion',
        editionYear: 2003,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[2].id, // Fantaisie / Mythologie
        writerId: writers[21].id, // Anonymous Collectif
        userId: users[0].id,
      },
      {
        title: 'Kid Paddle',
        numberOfPages: 64,
        pdfLink: 'https://example.com/kidpaddle.pdf',
        abstract: "Aventure humoristique inspirée de l'univers des jeux vidéo.",
        editor: 'Dupuis',
        editionYear: 1996,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[9].id, // Jeunesse
        writerId: writers[21].id, // Anonymous Collectif
        userId: users[1].id,
      },
      {
        title: 'Sartre — pétition 23/01/77',
        numberOfPages: 112,
        pdfLink: 'https://example.com/sartre-petition.pdf',
        abstract: 'Analyse critique d’un texte engagé signé par Sartre en 1977.',
        editor: 'Les Temps Modernes',
        editionYear: 1977,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[5].id, // Philosophie
        writerId: writers[14].id, // Simone de Beauvoir
        userId: users[0].id,
      },
      {
        title: 'The Prince',
        numberOfPages: 140,
        pdfLink: 'https://example.com/the-prince.pdf',
        abstract: 'Traité politique fondateur sur le pouvoir, la stratégie et la realpolitik.',
        editor: 'Oxford Classics',
        editionYear: 1532,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[5].id, // Philosophie
        writerId: writers[19].id, // Machiavelli
        userId: users[1].id,
      },
      {
        title: 'Maoism & Life Expectancy in China',
        numberOfPages: 368,
        pdfLink: 'https://example.com/maoism.pdf',
        abstract: "Étude moderne sur l'impact des politiques maoïstes sur la santé en Chine.",
        editor: 'Cambridge University Press',
        editionYear: 2019,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[14].id, // Science
        writerId: writers[21].id, // Anonymous (academic)
        userId: users[0].id,
      },
      {
        title: 'Capital Vol. 1',
        numberOfPages: 816,
        pdfLink: 'https://example.com/capital1.pdf',
        abstract: 'Analyse fondamentale du capitalisme et de la production.',
        editor: 'Penguin Classics',
        editionYear: 1867,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[5].id, // Philosophie / économie politique
        writerId: writers[15].id, // Karl Marx
        userId: users[1].id,
      },
      {
        title: 'The Art of War',
        numberOfPages: 112,
        pdfLink: 'https://example.com/art-of-war.pdf',
        abstract: 'Classique de stratégie militaire et de psychologie du conflit.',
        editor: 'Shambhala',
        editionYear: -500,
        imagePath: '/covers/nicolas_sarkozy.jpg',
        categoryId: categories[5].id, // Philosophie stratégique
        writerId: writers[20].id, // Sun Tzu
        userId: users[0].id,
      },
    ])
  }
}
