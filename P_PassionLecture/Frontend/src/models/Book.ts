import type { Writer } from '@/models/Writer'
import type { Category } from '@/models/Category'

export interface Book {
  id: number
  title: string
  numberOfPages: number
  pdfLink: string
  abstract: string
  editor: string
  editionYear: number
  imagePath: string
  comment: string
  categoryId: number
  writerId: number
  userId: number
  global_rating: number
  total_comments: number
  writer: Writer
  category: Category
}

export interface BookCreation {
  title: string
  categoryId: number
  writerId: number
  numberOfPages: number
  pdfLink: string
  abstract: string
  editor: string
  imagePath: string
  editionYear: number
}
