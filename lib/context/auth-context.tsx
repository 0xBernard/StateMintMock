'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { getMemoryItem, setMemoryItem } from '@/lib/store/memory-store'

interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: () => void
  logout: () => void
  showLoginDialog: boolean
  setShowLoginDialog: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUser: User = {
  id: '1',
  name: 'Nathan Reichlin',
  email: 'nathan.reichlin@example.com'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const stored = getMemoryItem<boolean>('isAuthenticated')
    return stored ?? false
  })

  const [user, setUser] = useState<User | null>(() => {
    const stored = getMemoryItem<User>('user')
    return stored ?? null
  })

  const [showLoginDialog, setShowLoginDialog] = useState(false)

  // Debug function to log when login dialog state changes
  const setShowLoginDialogDebug = (show: boolean) => {
    console.log('setShowLoginDialog called:', show)
    setShowLoginDialog(show)
  }

  const login = () => {
    setIsAuthenticated(true)
    setUser(mockUser)
    setMemoryItem('isAuthenticated', true)
    setMemoryItem('user', mockUser)
    setShowLoginDialog(false)
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setMemoryItem('isAuthenticated', false)
    setMemoryItem('user', null)
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout,
      showLoginDialog,
      setShowLoginDialog: setShowLoginDialogDebug
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 