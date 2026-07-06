import { Link, useNavigate } from 'react-router-dom'
import { Settings, ChevronRight, LogOut, UserCircle } from 'lucide-react'
import { ENTIDADES } from '../api/entidades'
import { useAuth } from '../context/AuthContext'

export default function Mais() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const sair = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Mais</h1>

      {usuario && (
        <div className="flex items-center gap-3 bg-surface border border-border rounded-lg px-3 py-3 mb-6">
          <UserCircle className="w-8 h-8 text-faint shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{usuario.nome}</p>
            <p className="text-xs text-muted truncate">{usuario.email}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted mb-2">Cadastros</p>
      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface mb-6">
        {Object.entries(ENTIDADES).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <Link
              key={key}
              to={`/cadastros/${key}`}
              className="flex items-center gap-3 px-3 py-3 hover:bg-surface-2 transition-colors"
            >
              <Icon className="w-4 h-4 text-muted shrink-0" />
              <span className="flex-1 text-sm">{cfg.label}</span>
              <ChevronRight className="w-4 h-4 text-faint shrink-0" />
            </Link>
          )
        })}
      </div>

      <p className="text-sm text-muted mb-2">Preferências</p>
      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface mb-6">
        <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-3 hover:bg-surface-2 transition-colors">
          <Settings className="w-4 h-4 text-muted shrink-0" />
          <span className="flex-1 text-sm">Configurações</span>
          <ChevronRight className="w-4 h-4 text-faint shrink-0" />
        </Link>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        <button
          type="button"
          onClick={sair}
          className="w-full flex items-center gap-3 px-3 py-3 text-red-500 hover:bg-surface-2 transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-sm text-left">Sair</span>
        </button>
      </div>
    </div>
  )
}
