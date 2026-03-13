import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import Category from './category.js'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Writer from './writer.js'
import User from './user.js'
import Comment from './comment.js'
import Tag from './tag.js'

export default class Book extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare author: string | null

  //number = Small Int
  @column()
  declare numberOfPages: number | null

  @column()
  declare pdfLink: string | null

  //résumé du livre
  @column()
  declare abstract: string | null

  @column()
  declare editor: string | null

  //number = Small Int
  @column()
  declare editionYear: number | null

  @column()
  declare epubFile: Buffer | null // MEDIUMBLOB – null pour les livres ajoutés via formulaire

  @column()
  declare coverImage: Buffer | null

  @column()
  declare imagePath: string | null

  //Récupération des 3 clefs étrangères
  @column()
  declare categoryId: number | null

  @column()
  declare writerId: number | null

  @column()
  declare userId: number | null

  //Assignation des clefs étrangères à book
  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @belongsTo(() => Writer)
  declare writer: BelongsTo<typeof Writer>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => Comment)
  declare comment: HasMany<typeof Comment>

  @manyToMany(() => Tag, {
    pivotTable: 'book_tag',
  })
  declare tags: ManyToMany<typeof Tag>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}