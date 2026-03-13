import axios from 'axios'
import { ref } from 'vue'
import type { Book as BookModel } from '@/models/Book'
import type { Evaluate } from '@/models/Evaluate'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type Book = BookModel
export interface BookReview {
  evaluateId?: number | null
  userId: number | null
  username: string | null
  rating: number
  comment: string | null
}

export interface CreateBookPayload {
  title: string
  category_id: number
  writer_id: number
  number_of_pages: number
  pdf_link: string
  abstract: string
  editor: string
  image_path: string
  edition_year: number | Date
}

// -----------------------------
// API calls
// -----------------------------

export async function homePageAPI(): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>(`${API_BASE_URL}/books/home`)
    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    return []
  }
}

export async function booksRatingAvg(
  bookId: number,
): Promise<{ evaluates: Evaluate[]; averageRating: number }> {
  try {
    const res = await axios.get(`${API_BASE_URL}/books/${bookId}/AvgRating`)
    return res.data
  } catch (err) {
    console.error('Failed to load ratings:', err)
    return { evaluates: [], averageRating: 0 }
  }
}

export async function fetchBookReviews(bookId: number): Promise<BookReview[]> {
  try {
    const res = await axios.get<BookReview[]>(`${API_BASE_URL}/books/${bookId}/Rewiews`)
    return res.data
  } catch (err) {
    console.error('Failed to load reviews:', err)
    throw err
  }
}

export interface ReviewPayload {
  book_id: number
  rating: number
  comment: string
}

export async function createReview(payload: ReviewPayload): Promise<BookReview> {
  const token = localStorage.getItem('authToken')
  try {
    const res = await axios.post<BookReview>(`${API_BASE_URL}/evaluates`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    console.error('Failed to create review:', err)
    throw err
  }
}

export async function updateReview(
  bookId: number,
  payload: Partial<ReviewPayload> & { book_id: number },
): Promise<BookReview> {
  const token = localStorage.getItem('authToken')
  try {
    const res = await axios.put<BookReview>(`${API_BASE_URL}/evaluates/${bookId}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.data
  } catch (err) {
    console.error('Failed to update review:', err)
    throw err
  }
}

export async function getBooks(): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>(`${API_BASE_URL}/books`)
    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    return []
  }
}

const error = ref<string | null>(null)

export async function fetchBook(bookId: number): Promise<Book> {
  error.value = null

  try {
    const response = await axios.get<Book>(`${API_BASE_URL}/books/${bookId}`)
    return response.data
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function updateBook(
  bookId: number,
  payload: Partial<CreateBookPayload>,
): Promise<Book> {
  const token = localStorage.getItem('authToken')

  try {
    const normalizedPayload: Partial<CreateBookPayload> = {
      ...payload,
      edition_year:
        payload.edition_year instanceof Date ? payload.edition_year.getFullYear() : payload.edition_year,
    }

    const res = await axios.put<Book>(`${API_BASE_URL}/books/${bookId}`, normalizedPayload, {
      headers: { Authorization: `Bearer ${token}` },
    })

    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    throw err
  }
}

export async function createBook(input: CreateBookPayload): Promise<{ id: number }> {
  const token = localStorage.getItem('authToken')

  const payload = {
    title: input.title,
    category_id: input.category_id,
    writer_id: input.writer_id,
    number_of_pages: input.number_of_pages,
    pdf_link: input.pdf_link,
    abstract: input.abstract,
    editor: input.editor,
    image_path: input.image_path,
    edition_year:
      input.edition_year instanceof Date
        ? input.edition_year.getFullYear()
        : input.edition_year,
  }

  const res = await axios.post<{ id: number }>(`${API_BASE_URL}/books`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  })

  return res.data
}

export async function deleteBook(bookId: number): Promise<void> {
  const token = localStorage.getItem('authToken')

  await axios.delete(`${API_BASE_URL}/books/${bookId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}
