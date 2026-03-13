import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Category {
  id: number
  label: string
}

export async function getCategories(): Promise<Category[]> {
  const res = await axios.get(`${API_BASE_URL}/categories`)
  return res.data
}
