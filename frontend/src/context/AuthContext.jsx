import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('novello_token')
    const savedUser = localStorage.getItem('novello_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await authApi.login({ email, password })
    const { token: newToken, ...userData } = res.data
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('novello_token', newToken)
    localStorage.setItem('novello_user', JSON.stringify(userData))
    return userData
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const { token: newToken, ...userData } = res.data
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('novello_token', newToken)
    localStorage.setItem('novello_user', JSON.stringify(userData))
    return userData
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('novello_token')
    localStorage.removeItem('novello_user')
  }

  const isAdmin = () => user?.role === 'ADMIN'
  const isAuthenticated = () => !!token

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
