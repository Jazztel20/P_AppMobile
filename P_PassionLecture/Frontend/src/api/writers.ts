import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Writer {
  id: number
  firstname: string
  lastname: string
}

export async function getWriters(): Promise<Writer[]> {
  const res = await axios.get(`${API_BASE_URL}/writers`)
  return res.data
}

export async function createWriter(firstname: string, lastname: string): Promise<Writer> {
  const res = await axios.post(`${API_BASE_URL}/writers`, {
    firstname,
    lastname,
  })
  return res.data
}
