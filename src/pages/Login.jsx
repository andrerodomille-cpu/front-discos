import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Disc3, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
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
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[1.1fr_1fr]">
      <div className="relative flex min-h-[36vh] flex-col overflow-hidden bg-accent p-7 text-accent-contrast sm:p-10 lg:min-h-screen lg:p-14">
        <div className="flex items-center gap-2">
          <Disc3 className="h-5 w-5" />
          <span className="u-condensed text-sm opacity-80">Catálogo pessoal</span>
        </div>

        <div className="mt-auto flex flex-col gap-5 pt-16">
          <h1 className="font-display text-[clamp(2.6rem,8vw,4.75rem)] font-extrabold leading-[0.92] tracking-[-0.03em]">
            Coleção
            <br />
            de Discos
          </h1>
          <p className="u-ident opacity-75">LP · 33⅓ RPM · edição pessoal</p>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-44 -right-44 h-96 w-96 rounded-full"
          style={{
            background:
              'repeating-radial-gradient(circle, transparent 0 11px, rgba(0,0,0,0.07) 11px 12px)',
          }}
        />
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={entrar} className="flex w-full max-w-sm flex-col gap-5">
          <div>
            <h2 className="text-2xl">Entrar</h2>
            <p className="mt-1 text-sm text-muted">Acesse sua coleção.</p>
          </div>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">E-mail</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
                placeholder="voce@email.com"
                className="u-field pl-9"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Senha</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="u-field pl-9 pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                tabIndex={-1}
                aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-foreground"
              >
                {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {erro && <p className="text-sm text-red-500">{erro}</p>}

          <button type="submit" disabled={entrando} className="u-btn u-btn-primary mt-1 w-full py-2.5">
            {entrando && <Loader2 className="h-4 w-4 animate-spin" />}
            {entrando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
