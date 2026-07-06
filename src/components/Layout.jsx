import { Link, Outlet, useLocation } from 'react-router-dom'
import { Settings, Disc3, Library, Heart, Headphones, LayoutDashboard, MoreHorizontal } from 'lucide-react'
import { ENTIDADES } from '../api/entidades'

const ABAS_MOBILE = [
  { to: '/', label: 'Coleção', icon: Library, ativo: (path) => path === '/' || path.startsWith('/discos') },
  { to: '/wishlist', label: 'Wishlist', icon: Heart, ativo: (path) => path.startsWith('/wishlist') },
  { to: '/audicoes', label: 'Audições', icon: Headphones, ativo: (path) => path.startsWith('/audicoes') },
  { to: '/dashboards', label: 'Dashboards', icon: LayoutDashboard, ativo: (path) => path.startsWith('/dashboards') },
  {
    to: '/mais',
    label: 'Mais',
    icon: MoreHorizontal,
    ativo: (path) => path === '/mais' || path.startsWith('/cadastros') || path === '/configuracoes',
  },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Disc3 className="w-6 h-6 text-accent" />
            Coleção de Discos
          </Link>
          <Link
            to="/configuracoes"
            className="p-2 rounded-full hover:bg-surface-2 text-muted"
            aria-label="Configurações"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
        <nav className="hidden sm:flex gap-2 overflow-x-auto px-4 pb-3 max-w-5xl mx-auto no-scrollbar">
          <Link
            to="/"
            title="Coleção"
            aria-label="Coleção"
            className={`shrink-0 p-2 rounded-full border transition-colors ${
              location.pathname === '/'
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            <Library className="w-4 h-4" />
          </Link>
          <Link
            to="/wishlist"
            title="Wishlist"
            aria-label="Wishlist"
            className={`shrink-0 p-2 rounded-full border transition-colors ${
              location.pathname.startsWith('/wishlist')
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            <Heart className="w-4 h-4" />
          </Link>
          <Link
            to="/audicoes"
            title="Audições"
            aria-label="Audições"
            className={`shrink-0 p-2 rounded-full border transition-colors ${
              location.pathname.startsWith('/audicoes')
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            <Headphones className="w-4 h-4" />
          </Link>
          <Link
            to="/dashboards"
            title="Dashboards"
            aria-label="Dashboards"
            className={`shrink-0 p-2 rounded-full border transition-colors ${
              location.pathname.startsWith('/dashboards')
                ? 'bg-accent text-accent-contrast border-accent'
                : 'border-border-strong text-muted hover:border-accent hover:text-accent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
          </Link>
          {Object.entries(ENTIDADES).map(([key, cfg]) => {
            const to = `/cadastros/${key}`
            const ativo = location.pathname === to
            const Icon = cfg.icon
            return (
              <Link
                key={key}
                to={to}
                title={cfg.label}
                aria-label={cfg.label}
                className={`shrink-0 p-2 rounded-full border transition-colors ${
                  ativo
                    ? 'bg-accent text-accent-contrast border-accent'
                    : 'border-border-strong text-muted hover:border-accent hover:text-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6 pb-20 sm:pb-6">
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-surface/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch justify-around">
          {ABAS_MOBILE.map(({ to, label, icon: Icon, ativo }) => {
            const ativa = ativo(location.pathname)
            return (
              <Link
                key={to}
                to={to}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] ${
                  ativa ? 'text-accent' : 'text-faint'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
