import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Book from '#models/book'
import fs from 'node:fs'
import path from 'node:path'

export default class extends BaseSeeder {
  async run() {
    // 1. Définir le dossier où se trouvent tes epubs
    // On remonte de 'p-web-back-end' vers la racine du repo pour trouver 'books'
    const booksDirectory = path.join(process.cwd(), '..', '..', 'books')

    // 2. Liste des fichiers à importer (noms exacts de tes fichiers sur GitHub)
    const filesToImport = [
      { title: 'A Christmas Carol', author: 'Charles Dickens', fileName: 'Dickens, Charles - A Christmas Carol.epub' },
      { title: 'Oliver Twist', author: 'Charles Dickens', fileName: 'Dickens, Charles - Oliver Twist.epub' },
      { title: 'Sherlock Holmes', author: 'Arthur Conan Doyle', fileName: 'Doyle, Artur Conan - Sherlock Holmes.epub' },
      { title: 'Les trois mousquetaires', author: 'Alexandre Dumas', fileName: 'Dumas, Alexandre - Les trois mousquetaires.epub' },
      { title: 'Fables', author: 'Jean de La Fontaine', fileName: 'La Fontaine, Jean de - Fables.epub' },
      { title: 'Le tour du monde en 80 jours', author: 'Jules Verne', fileName: 'Verne, Jules - Le tour du monde en quatre-vingts jours.epub' }
    ]

    for (const file of filesToImport) {
      const filePath = path.join(booksDirectory, file.fileName)

      // Vérifier si le fichier existe avant de tenter la lecture
      if (fs.existsSync(filePath)) {
        const epubBuffer = fs.readFileSync(filePath)

        // Création en base de données avec le contenu binaire (BLOB)
        await Book.updateOrCreate(
          { title: file.title }, // Évite les doublons si tu relances le seeder
          {
            author: file.author,
            epubFile: epubBuffer, // Stocké en MEDIUMBLOB [cite: 109]
            // La date d'insertion est gérée automatiquement par 'createdAt' dans le modèle
          }
        )
        console.log(`Importé : ${file.title}`)
      } else {
        console.error(`Fichier introuvable : ${filePath}`)
      }
    }
  }
}