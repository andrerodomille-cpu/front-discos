import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Loader2 } from 'lucide-react'
import api from '../api/client'
import AudicaoItem from '../components/AudicaoItem'

export default function Audicoes() {
  const [audicoes, setAudicoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')

  const carregar = () => {
    setLoading(true)
    setErro(null)
    api
      .get('/audicoes')
      .then((res) => setAudicoes(res.data))
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  const audicoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return audicoes
    return audicoes.filter((a) =>
      [a.disco_titulo, a.artista_nome, a.local]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termo)),
    )
  }, [audicoes, busca])

  const remover = async (id) => {
    if (!confirm('Remover este registro de audição?')) return
    try {
      await api.delete(`/audicoes/${id}`)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="pb-16">
      <h1 className="mb-1 text-2xl">Audições</h1>
      <p className="mb-5 text-sm text-muted">Seu diário de escuta.</p>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por disco, artista, local…"
          className="u-field pl-9"
        />
      </div>

      <Link
        to="/audicoes/nova"
        title="Registrar audição"
        aria-label="Registrar audição"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-5 z-30 flex items-center justify-center rounded-full bg-accent p-4 text-accent-contrast shadow-[0_6px_20px_-4px_rgba(0,0,0,0.4)] transition-colors hover:bg-accent-hover lg:bottom-8"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-faint">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando audições…
        </div>
      )}

      {erro && !loading && <p className="py-20 text-center text-sm text-red-500">Erro: {erro}</p>}

      {!loading && !erro && audicoesFiltradas.length === 0 && (
        <div className="py-20 text-center text-faint">
          {audicoes.length === 0 ? 'Nenhuma audição registrada ainda.' : 'Nenhuma audição encontrada para essa busca.'}
        </div>
      )}

      {!loading && !erro && audicoesFiltradas.length > 0 && (
        <>
          <p className="mb-3 text-xs tabular-nums text-faint">
            {audicoesFiltradas.length} {audicoesFiltradas.length === 1 ? 'audição' : 'audições'}
          </p>
          <div className="divide-y divide-border border-y border-border">
            {audicoesFiltradas.map((audicao) => (
              <AudicaoItem key={audicao.id_audicao} audicao={audicao} onRemover={remover} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
