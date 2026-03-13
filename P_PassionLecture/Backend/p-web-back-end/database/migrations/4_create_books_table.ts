import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'books'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.string('author').nullable()
      table.smallint('number_of_pages').unsigned().nullable()
      table.text('pdf_link').nullable()
      table.text('abstract').nullable()
      table.string('editor').nullable()
      table.smallint('edition_year').unsigned().nullable()
      table.string('image_path').nullable()

      // Contenu EPUB stocké en BLOB (nullable : les livres ajoutés par l'utilisateur via formulaire n'ont pas d'epub)
      table.specificType('epub_file', 'MEDIUMBLOB').nullable()
      table.specificType('cover_image', 'MEDIUMBLOB').nullable()

      table
        .integer('category_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('categories')
        .onDelete('SET NULL')

      table
        .integer('writer_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('writers')
        .onDelete('SET NULL')

      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
