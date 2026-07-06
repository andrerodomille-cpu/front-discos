import { Link, useLocation } from 'react-router-dom'

const ABAS = [
  { to: '/dashboards', label: 'Coleção' },
  { to: '/dashboards/audicoes', label: 'Audições' },
  { to: '/dashboards/financeiro', label: 'Financeiro' },
  { to: '/dashboards/wishlist', label: 'Wishlist' },
  { to: '/dashboards/artistas', label: 'Artistas' },
  { to: '/dashboards/musicos', label: 'Músicos' },
]

export default function DashboardTabs() {
  const location = useLocation()

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {ABAS.map((aba) => {
        const ativa = location.pathname === aba.to
        return (
          <Link
            key={aba.to}
            to={aba.to}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              ativa
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            {aba.label}
          </Link>
        )
      })}
    </div>
  )
}
