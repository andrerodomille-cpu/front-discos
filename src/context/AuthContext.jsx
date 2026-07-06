import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, {
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USUARIO_STORAGE_KEY,
  definirCallbackNaoAutorizado,
  getAuthToken,
} from '../api/client'

const AuthContext = createContext(null)

function usuarioInicial() {
  try {
    const bruto = localStorage.getItem(AUTH_USUARIO_STORAGE_KEY)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getAuthToken)
  const [usuario, setUsuario] = useState(usuarioInicial)

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    localStorage.removeItem(AUTH_USUARIO_STORAGE_KEY)
    setToken(null)
    setUsuario(null)
  }, [])

  useEffect(() => {
    definirCallbackNaoAutorizado(logout)
  }, [logout])

  const login = async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token)
    localStorage.setItem(AUTH_USUARIO_STORAGE_KEY, JSON.stringify(data.usuario))
    setToken(data.token)
    setUsuario(data.usuario)
  }

  return (
    <AuthContext.Provider value={{ token, usuario, autenticado: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
