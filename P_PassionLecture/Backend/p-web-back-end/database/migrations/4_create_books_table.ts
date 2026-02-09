import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'books'
  schema: any

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.string('author').nullable()
      // Utilisation de MEDIUMBLOB pour les fichiers binaires selon le document technique
      table.specificType('epub_file', 'MEDIUMBLOB').notNullable()
      table.specificType('cover_image', 'MEDIUMBLOB').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

      //Déclaration des foreign keys 
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories')  //quelle référence pour cerner en majuscule ou minuscule?
        .onDelete('SET NULL') //malgré suppression de livres/commentaires la catégorie est permanente 

      table
        .integer('writer_id')
        .unsigned()
        .references('id')
        .inTable('writers')
        .onDelete('SET NULL') // a checker ultérieurement (logique)

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE') // si on supprime le user on supprime ses livres

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}