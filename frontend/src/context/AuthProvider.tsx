import { useEffect, useState, type ReactNode } from 'react'

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from '../services/auth.service'

import type { LoginInput, RegisterInput, User } from '../types/auth'

import { AuthContext } from './AuthContext'

const TOKEN_KEY = 'codelens_token'

export default function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY),
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await getCurrentUser(token)
        setUser(response.data)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [token])

  async function login(input: LoginInput) {
    const response = await loginUser(input)
    localStorage.setItem(TOKEN_KEY, response.data.token)
    setToken(response.data.token)
    setUser(response.data.user)
  }

  async function register(input: RegisterInput) {
    const response = await registerUser(input)
    localStorage.setItem(TOKEN_KEY, response.data.token)
    setToken(response.data.token)
    setUser(response.data.user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
