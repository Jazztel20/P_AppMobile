import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'books'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.string('author').nullable()

      table.specificType('epub_file', 'MEDIUMBLOB').notNullable()
      table.specificType('cover_image', 'MEDIUMBLOB').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')

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
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.timestamps(true)
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
