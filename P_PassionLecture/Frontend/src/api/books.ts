import axios from 'axios'

// -----------------------------
// Types
// -----------------------------
export interface Book {
  id: number
  title: string

  // champs backend (snake_case)
  image_path?: string
  number_of_pages?: number
  pdf_link?: string
  abstract?: string
  editor?: string
  edition_year?: number
  category_id?: number
  writer_id?: number
  user_id?: number

  // relations possibles (si preload côté backend)
  writer?: { firstname: string; lastname: string }
  category?: { name: string }
  user?: { id: number; username: string }
}

export interface Evaluate {
  id: number
  note: number
}

export type CreateBookPayload = {
  title: string
  category_id: number
  number_of_pages: number
  pdf_link: string
  abstract: string
  editor: string
  edition_year: number
  image_path: string
  writer_id: number
}

// -----------------------------
// API calls
// -----------------------------

export async function homePageAPI(): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>('http://localhost:3333/books/home')
    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    return []
  }
}

export async function getBooks(): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>('http://localhost:3333/books')
    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    return []
  }
}

export async function booksRatingAvg(
  bookId: number
): Promise<{ evaluates: Evaluate[]; averageRating: number }> {
  try {
    const res = await axios.get(`http://localhost:3333/books/${bookId}/AvgRating`)
    return res.data
  } catch (err) {
    console.error('Failed to load ratings:', err)
    return { evaluates: [], averageRating: 0 }
  }
}

export async function EditBook(bookId: number): Promise<Book> {
  try {
    const res = await axios.get<Book>(`http://localhost:3333/books/${bookId}`)
    return res.data
  } catch (err) {
    console.error('Failed to load book:', err)
    // fallback minimal sans casser TS
    return { id: 0, title: '' }
  }
}

export async function createBook(payload: CreateBookPayload) {
  const token = localStorage.getItem('authToken')

  const res = await axios.post('http://localhost:3333/books', payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  return res.data
}
