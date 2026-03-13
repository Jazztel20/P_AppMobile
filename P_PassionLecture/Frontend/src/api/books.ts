import axios from 'axios'

const BASE = 'http://localhost:3333'

// -----------------------------
// Types
// -----------------------------
export interface Book {
  id: number
  title: string

  // champs backend (snake_case depuis l'API AdonisJS)
  image_path?: string
  imagePath?: string
  number_of_pages?: number
  numberOfPages?: number
  pdf_link?: string
  pdfLink?: string
  abstract?: string
  editor?: string
  edition_year?: number
  editionYear?: number
  author?: string
  category_id?: number
  writer_id?: number
  user_id?: number

  // relations éventuelles (si preload côté backend)
  writer?: { id?: number; firstname: string; lastname: string }
  category?: { id?: number; label: string; name?: string }
  user?: { id: number; username: string }
}

export interface Review {
  userId: number
  username: string | null
  rating: number
  comment: string | null
}

export interface Comment {
  id: number
  comment: string
  bookId: number
  userId: number
  user?: { id: number; username: string }
  createdAt?: string
}

export interface Evaluate {
  id: number
  note: number
  bookId?: number
  userId?: number
}

export interface Tag {
  id: number
  name: string
  description: string | null
  userId?: number
  books?: Book[]
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
// Helper: Auth header
// -----------------------------
function authHeader() {
  const token = localStorage.getItem('authToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// -----------------------------
// Books API
// -----------------------------

/** Page d'accueil : 5 livres récents */
export async function homePageAPI(): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>(`${BASE}/books/home`)
    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    return []
  }
}

/** Tous les livres */
export async function getBooks(): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>(`${BASE}/books`)
    return res.data
  } catch (err) {
    console.error('Failed to load books:', err)
    return []
  }
}

/** Recherche de livres par titre */
export async function searchBooks(q: string): Promise<Book[]> {
  try {
    const res = await axios.get<Book[]>(`${BASE}/books/search`, { params: { q } })
    return res.data
  } catch (err) {
    console.error('Failed to search books:', err)
    return []
  }
}

/** Détail d'un livre */
export async function fetchBook(bookId: number): Promise<Book> {
  const res = await axios.get<Book>(`${BASE}/books/${bookId}`)
  return res.data
}

/** Mettre à jour un livre */
export async function updateBook(bookId: number, payload: Partial<CreateBookPayload>): Promise<Book> {
  const res = await axios.put<Book>(`${BASE}/books/${bookId}`, payload, {
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
  })
  return res.data
}

/** Créer un livre */
export async function createBook(payload: CreateBookPayload) {
  const res = await axios.post(`${BASE}/books`, payload, {
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
  })
  return res.data
}

/** Supprimer un livre */
export async function deleteBook(bookId: number) {
  const res = await axios.delete(`${BASE}/books/${bookId}`, {
    headers: authHeader(),
  })
  return res.data
}

/** Note moyenne d'un livre */
export async function booksRatingAvg(
  bookId: number
): Promise<{ evaluates: Evaluate[]; averageRating: number }> {
  try {
    const res = await axios.get(`${BASE}/books/${bookId}/AvgRating`)
    return res.data
  } catch (err) {
    console.error('Failed to load ratings:', err)
    return { evaluates: [], averageRating: 0 }
  }
}

/** Avis (notes + commentaires fusionnés) d'un livre */
export async function getBookReviews(bookId: number): Promise<Review[]> {
  try {
    const res = await axios.get<Review[]>(`${BASE}/books/${bookId}/reviews`)
    return res.data
  } catch (err) {
    console.error('Failed to load reviews:', err)
    return []
  }
}

/** Commentaires bruts d'un livre */
export async function getBookComments(bookId: number): Promise<Comment[]> {
  try {
    const res = await axios.get<Comment[]>(`${BASE}/books/${bookId}/comments`)
    return res.data
  } catch (err) {
    console.error('Failed to load comments:', err)
    return []
  }
}

/** Poster un commentaire */
export async function postComment(bookId: number, content: string): Promise<Comment> {
  const res = await axios.post<Comment>(
    `${BASE}/comments`,
    { book_id: bookId, content },
    { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
  )
  return res.data
}

/** Poster une note (évaluation) */
export async function postEvaluate(bookId: number, note: number): Promise<Evaluate> {
  const res = await axios.post<Evaluate>(
    `${BASE}/evaluates`,
    { book_id: bookId, content: note },
    { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
  )
  return res.data
}

// -----------------------------
// Tags API
// -----------------------------

/** Tous les tags de l'utilisateur connecté */
export async function getTags(): Promise<Tag[]> {
  try {
    const res = await axios.get<Tag[]>(`${BASE}/tags`, { headers: authHeader() })
    return res.data
  } catch (err) {
    console.error('Failed to load tags:', err)
    return []
  }
}

/** Créer un tag */
export async function createTag(name: string, description: string): Promise<Tag> {
  const res = await axios.post<Tag>(
    `${BASE}/tags`,
    { name, description },
    { headers: { ...authHeader(), 'Content-Type': 'application/json' } }
  )
  return res.data
}

/** Supprimer un tag */
export async function deleteTag(tagId: number) {
  const res = await axios.delete(`${BASE}/tags/${tagId}`, { headers: authHeader() })
  return res.data
}

/** Attacher un livre à un tag */
export async function attachBookToTag(tagId: number, bookId: number) {
  const res = await axios.post(
    `${BASE}/tags/${tagId}/books/${bookId}`,
    {},
    { headers: authHeader() }
  )
  return res.data
}

/** Détacher un livre d'un tag */
export async function detachBookFromTag(tagId: number, bookId: number) {
  const res = await axios.delete(`${BASE}/tags/${tagId}/books/${bookId}`, {
    headers: authHeader(),
  })
  return res.data
}
