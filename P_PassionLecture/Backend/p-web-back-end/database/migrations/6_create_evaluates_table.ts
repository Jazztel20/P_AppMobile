import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'evaluates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.specificType('note', 'tinyint')

      table
      .integer('book_id')
      .unsigned()
      .references('id')
      .inTable('books')
      .onDelete('CASCADE') // Si on supprime 1 livre -> le/s évaluation/s est supprimé

      table
      .integer('user_id')
      .unsigned()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE') // si on supprime le user on supprime ses évaluations

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}