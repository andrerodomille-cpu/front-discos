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
  const { pathname } = useLocation()

  return (
    <div className="-mx-4 mb-6 overflow-x-auto border-b border-border px-4 no-scrollbar sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-5">
        {ABAS.map((aba) => {
          const ativa = pathname === aba.to
          return (
            <Link
              key={aba.to}
              to={aba.to}
              className={`-mb-px border-b-2 pb-2 pt-1 text-sm transition-colors ${
                ativa
                  ? 'border-accent font-semibold text-foreground'
                  : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {aba.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
