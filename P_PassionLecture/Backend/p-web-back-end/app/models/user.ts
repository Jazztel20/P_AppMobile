import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Comment from './comment.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Evaluate from './evaluate.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string 
  
  @column()
  declare isAdmin: boolean

  @column({ serializeAs: null })
  declare password: string

  @hasMany(()=> Comment)
  declare comment: HasMany<typeof Comment> 
  
  @hasMany(() => Evaluate)
  declare evaluates: HasMany<typeof Evaluate>

  //Représente la propriété creationDate
  @column.dateTime({ autoCreate: true })
  declare creationDate: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
  static id: number | null | undefined
}