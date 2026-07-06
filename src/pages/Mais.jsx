import { Link } from 'react-router-dom'
import { Settings, ChevronRight } from 'lucide-react'
import { ENTIDADES } from '../api/entidades'

export default function Mais() {
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Mais</h1>

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
      <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface">
        <Link to="/configuracoes" className="flex items-center gap-3 px-3 py-3 hover:bg-surface-2 transition-colors">
          <Settings className="w-4 h-4 text-muted shrink-0" />
          <span className="flex-1 text-sm">Configurações</span>
          <ChevronRight className="w-4 h-4 text-faint shrink-0" />
        </Link>
      </div>
    </div>
  )
}
