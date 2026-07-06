import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Disc3, Mail, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { autenticado, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState(null)

  if (autenticado) {
    const destino = location.state?.from?.pathname || '/'
    return <Navigate to={destino} replace />
  }

  const entrar = async (e) => {
    e.preventDefault()
    setErro(null)
    setEntrando(true)
    try {
      await login(email.trim(), senha)
      const destino = location.state?.from?.pathname || '/'
      navigate(destino, { replace: true })
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível entrar. Verifique seus dados.')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
            <Disc3 className="w-8 h-8 text-accent-contrast" />
          </div>
          <h1 className="text-lg font-semibold mt-2">Coleção de Discos</h1>
          <p className="text-sm text-muted">Entre para acessar sua coleção</p>
        </div>

        <form
          onSubmit={entrar}
          className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-xl shadow-black/5"
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">E-mail</span>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="voce@email.com"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Senha</span>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                tabIndex={-1}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-muted"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>

          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={entrando}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-accent-contrast font-medium py-2.5 rounded-lg mt-1"
          >
            {entrando ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
