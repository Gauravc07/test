"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type UserRole = "creator" | "brand" | null

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  verified?: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("shor_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      verified: Math.random() > 0.5,
    }

    setUser(mockUser)
    localStorage.setItem("shor_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      verified: false,
    }

    setUser(mockUser)
    localStorage.setItem("shor_user", JSON.stringify(mockUser))
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("shor_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
