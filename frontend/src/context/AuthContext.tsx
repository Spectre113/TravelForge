import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react'
import { User, LoginRequest, RegisterRequest } from '../types'
import { apiService } from '../services/api'

const TOKEN_KEY = 'budget-compass.auth.token'
const USER_KEY = 'budget-compass.auth.user'

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    const savedUser = localStorage.getItem(USER_KEY)

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        apiService.getProfile().catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        })
      } catch (error) {
        console.error('Failed to load auth data:', error)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await apiService.login(credentials)
      if (response.success && response.token && response.user) {
        setToken(response.token)
        setUser(response.user)
        localStorage.setItem(TOKEN_KEY, response.token)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      } else {
        throw new Error(response.error || 'Ошибка входа')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Ошибка входа')
    }
  }

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      const response = await apiService.register(data)
      if (response.success && response.token && response.user) {
        setToken(response.token)
        setUser(response.user)
        localStorage.setItem(TOKEN_KEY, response.token)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
      } else {
        throw new Error(response.error || 'Ошибка регистрации')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Ошибка регистрации')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated: !!token && !!user,
    }),
    [user, token, isLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

