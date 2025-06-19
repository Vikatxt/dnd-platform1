import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'
import { useRouter } from 'next/router'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/me')
        console.log('Отриманий юзер:', res.data)
        setUser(res.data)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // 🔐 Вхід
  const login = async (loginValue, password) => {
    const res = await api.post('/auth/login', {
      login: loginValue,
      password,
    })
    setUser(res.data.user)
    return res.data
  }

  // 🆕 Реєстрація
  const register = async ({ username, email, phone, password, nickname }) => {
    const res = await api.post('/auth/register', {
      username,
      email,
      phone,
      password,
      nickname,
    })
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
