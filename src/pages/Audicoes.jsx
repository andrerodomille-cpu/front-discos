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
    <div className="pb-16 sm:pb-14">
      <div className="mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por disco, artista, local..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <Link
        to="/audicoes/nova"
        title="Registrar audição"
        aria-label="Registrar audição"
        className="fixed z-30 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-contrast p-4 rounded-full shadow-lg shadow-black/30"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {loading && (
        <div className="flex items-center justify-center py-20 text-faint gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando audições...
        </div>
      )}

      {erro && !loading && <p className="text-center py-20 text-red-500 text-sm">Erro: {erro}</p>}

      {!loading && !erro && audicoesFiltradas.length === 0 && (
        <div className="text-center py-20 text-faint">
          {audicoes.length === 0 ? 'Nenhuma audição registrada ainda.' : 'Nenhuma audição encontrada para essa busca.'}
        </div>
      )}

      {!loading && !erro && audicoesFiltradas.length > 0 && (
        <>
          <p className="text-sm text-faint mb-3">
            {audicoesFiltradas.length} {audicoesFiltradas.length === 1 ? 'audição' : 'audições'}
          </p>
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface">
            {audicoesFiltradas.map((audicao) => (
              <AudicaoItem key={audicao.id_audicao} audicao={audicao} onRemover={remover} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
