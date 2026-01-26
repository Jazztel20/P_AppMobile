import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Book from './book.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class Evaluate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // number : tiny int
  @column()
  declare note: number
  
  //Récupération des 2 clefs étrangères 
  
  @column()
  declare bookId: number | null
  
  @column()
  declare userId: number | null
  
  //Assignation des clefs étrangères à book
  @belongsTo(()=> Book)
  declare book: BelongsTo<typeof Book>
    
  @belongsTo(()=> User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}