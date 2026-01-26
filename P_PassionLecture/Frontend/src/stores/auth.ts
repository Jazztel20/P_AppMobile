import { defineStore } from 'pinia'

export interface User {
  id: number
  username: string
  [key: string]: any  
}

const storedUser = localStorage.getItem('currentUser')

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (storedUser ? JSON.parse(storedUser) : null) as User | null,
  }),

  getters: {
    isLoggedIn: (state) => state.user !== null,
  },

  actions: {
    login(user: User) {
      this.user = user
      localStorage.setItem('currentUser', JSON.stringify(user))
    },

    logout() {
      this.user = null
      localStorage.removeItem('currentUser')
      localStorage.removeItem('authToken')
    },
  },
})
