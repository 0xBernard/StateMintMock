import { create } from 'zustand'
import { getMemoryItem, setMemoryItem } from './memory-store'

interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: () => void
  logout: () => void
}

const mockUser: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@example.com',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo'
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: getMemoryItem<boolean>('auth-isAuthenticated') ?? false,
  user: getMemoryItem<User>('auth-user') ?? null,
  login: () => {
    set({ isAuthenticated: true, user: mockUser })
    setMemoryItem('auth-isAuthenticated', true)
    setMemoryItem('auth-user', mockUser)
  },
  logout: () => {
    set({ isAuthenticated: false, user: null })
    setMemoryItem('auth-isAuthenticated', false)
    setMemoryItem('auth-user', null)
  },
})) 