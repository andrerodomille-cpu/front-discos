import { Link, useNavigate } from 'react-router-dom'
import { Settings, ChevronRight, LogOut, UserCircle, Heart } from 'lucide-react'
import { ENTIDADES } from '../api/entidades'
import { useAuth } from '../context/AuthContext'
import SectionHeading from '../components/SectionHeading'

export default function Mais() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const sair = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-5 text-2xl">Mais</h1>

      {usuario && (
        <div className="mb-8 flex items-center gap-3 border-l-2 border-accent pl-3">
          <UserCircle className="h-8 w-8 shrink-0 text-faint" />
          <div className="min-w-0">
            <p className="truncate font-display font-semibold tracking-[-0.01em]">{usuario.nome}</p>
            <p className="truncate text-xs text-muted">{usuario.email}</p>
          </div>
        </div>
      )}

      <SectionHeading className="mb-3">Coleção</SectionHeading>
      <div className="mb-8 divide-y divide-border border-y border-border">
        <Link
          to="/wishlist"
          className="u-spine flex items-center gap-3 py-3 pl-4 pr-3 transition-colors hover:bg-surface-2"
        >
          <Heart className="h-4 w-4 shrink-0 text-faint" />
          <span className="flex-1 text-sm">Wishlist</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
        </Link>
      </div>

      <SectionHeading className="mb-3">Cadastros</SectionHeading>
      <div className="mb-8 divide-y divide-border border-y border-border">
        {Object.entries(ENTIDADES).map(([key, cfg]) => {
          const Icon = cfg.icon
          return (
            <Link
              key={key}
              to={`/cadastros/${key}`}
              className="u-spine flex items-center gap-3 py-3 pl-4 pr-3 transition-colors hover:bg-surface-2"
            >
              <Icon className="h-4 w-4 shrink-0 text-faint" />
              <span className="flex-1 text-sm">{cfg.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
            </Link>
          )
        })}
      </div>

      <SectionHeading className="mb-3">Preferências</SectionHeading>
      <div className="mb-8 divide-y divide-border border-y border-border">
        <Link
          to="/configuracoes"
          className="u-spine flex items-center gap-3 py-3 pl-4 pr-3 transition-colors hover:bg-surface-2"
        >
          <Settings className="h-4 w-4 shrink-0 text-faint" />
          <span className="flex-1 text-sm">Configurações</span>
          <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
        </Link>
      </div>

      <button
        type="button"
        onClick={sair}
        className="flex w-full items-center gap-3 border-y border-border py-3 pl-4 pr-3 text-left text-red-500 transition-colors hover:bg-surface-2"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-sm">Sair</span>
      </button>
    </div>
  )
}
