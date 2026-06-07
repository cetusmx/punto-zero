/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  const token = localStorage.getItem('token')

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await api.get('/users/profile')
      setUser(data)
      setIsFirstLogin(localStorage.getItem('isFirstLogin') === 'true')
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('isFirstLogin')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const login = (newToken, firstLogin) => {
    localStorage.setItem('token', newToken)
    if (firstLogin) localStorage.setItem('isFirstLogin', 'true')
    else localStorage.removeItem('isFirstLogin')
    setIsFirstLogin(!!firstLogin)
    fetchProfile()
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isFirstLogin')
    setUser(null)
    setIsFirstLogin(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isFirstLogin, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
