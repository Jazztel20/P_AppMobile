import axios from 'axios'

export interface Writer {
  id: number
  firstname: string
  lastname: string
}

export async function getWriters(): Promise<Writer[]> {
  const res = await axios.get('http://localhost:3333/writers')
  return res.data
}

export async function createWriter(firstname: string, lastname: string): Promise<Writer> {
  const res = await axios.post('http://localhost:3333/writers', {
    firstname,
    lastname,
  })
  return res.data
}
