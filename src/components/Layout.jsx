import { Link, Outlet, useLocation } from 'react-router-dom'
import { Settings, Disc3, Library, Shuffle, Headphones, LayoutDashboard, MoreHorizontal } from 'lucide-react'

const ABAS = [
  { to: '/', label: 'Coleção', icon: Library, ativo: (p) => p === '/' || p.startsWith('/discos') },
  { to: '/sugestao', label: 'Sugestão', icon: Shuffle, ativo: (p) => p.startsWith('/sugestao') },
  { to: '/audicoes', label: 'Audições', icon: Headphones, ativo: (p) => p.startsWith('/audicoes') },
  { to: '/dashboards', label: 'Dashboards', icon: LayoutDashboard, ativo: (p) => p.startsWith('/dashboards') },
  {
    to: '/mais',
    label: 'Mais',
    icon: MoreHorizontal,
    ativo: (p) => p === '/mais' || p.startsWith('/wishlist') || p.startsWith('/cadastros') || p === '/configuracoes',
  },
]

export default function Layout() {
  const { pathname } = useLocation()
  const configAtivo = pathname === '/configuracoes'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop rail — the spine */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-16 z-30 flex-col items-center border-r border-border bg-surface">
        <Link
          to="/"
          aria-label="Coleção de Discos"
          className="flex h-16 w-full items-center justify-center text-accent"
        >
          <Disc3 className="h-6 w-6" />
        </Link>

        <nav className="flex flex-1 flex-col items-center gap-1 py-2">
          {ABAS.map(({ to, label, icon: Icon, ativo }) => {
            const ativa = ativo(pathname)
            return (
              <Link
                key={to}
                to={to}
                title={label}
                aria-label={label}
                data-active={ativa}
                className={`relative flex h-11 w-11 items-center justify-center rounded-[3px] transition-colors ${
                  ativa ? 'text-accent' : 'text-faint hover:text-foreground'
                }`}
              >
                {ativa && <span className="absolute left-[-10px] top-2 bottom-2 w-[3px] bg-accent" />}
                <Icon className="h-5 w-5" />
              </Link>
            )
          })}
        </nav>

        <span
          className="u-condensed my-4 select-none text-[10px] uppercase tracking-[0.22em] text-faint"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Coleção de Discos
        </span>

        <Link
          to="/configuracoes"
          aria-label="Configurações"
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-[3px] transition-colors ${
            configAtivo ? 'text-accent' : 'text-faint hover:text-foreground'
          }`}
        >
          <Settings className="h-5 w-5" />
        </Link>
      </aside>

      {/* Mobile / tablet header */}
      <header className="lg:hidden sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <Disc3 className="h-5 w-5 text-accent" />
            <span className="u-condensed text-[15px] uppercase tracking-[0.14em]">Coleção de Discos</span>
          </Link>
          <Link
            to="/configuracoes"
            className="-mr-2 p-2 text-muted hover:text-foreground"
            aria-label="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="lg:pl-16">
        <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:pb-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile / tablet bottom nav */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="flex items-stretch justify-around">
          {ABAS.map(({ to, label, icon: Icon, ativo }) => {
            const ativa = ativo(pathname)
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] ${
                  ativa ? 'text-accent' : 'text-faint'
                }`}
              >
                {ativa && <span className="absolute inset-x-5 top-0 h-[2px] bg-accent" />}
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
