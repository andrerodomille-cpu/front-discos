import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Loader2 } from 'lucide-react'
import api from '../api/client'
import WishlistItem from '../components/WishlistItem'

export default function Wishlist() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')

  const carregar = () => {
    setLoading(true)
    setErro(null)
    api
      .get('/wishlist')
      .then((res) => setItens(res.data))
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens
    return itens.filter((i) =>
      [i.titulo, i.artista_nome, i.formato_nome, i.genero_nome]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termo)),
    )
  }, [itens, busca])

  const toggleAdquirido = async (item) => {
    try {
      await api.put(`/wishlist/${item.id_wishlist}`, {
        titulo: item.titulo,
        id_artista: item.id_artista,
        id_formato: item.id_formato,
        id_genero: item.id_genero,
        ano_lancamento: item.ano_lancamento,
        numero_catalogo: item.numero_catalogo,
        observacoes: item.observacoes,
        prioridade: item.prioridade,
        adquirido: !item.adquirido,
      })
      carregar()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  const remover = async (id) => {
    if (!confirm('Remover este item da wishlist?')) return
    try {
      await api.delete(`/wishlist/${id}`)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="pb-16">
      <h1 className="mb-1 text-2xl">Wishlist</h1>
      <p className="mb-5 text-sm text-muted">Discos que você ainda quer.</p>

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título, artista, gênero, formato…"
          className="u-field pl-9"
        />
      </div>

      <Link
        to="/wishlist/novo"
        title="Novo item na wishlist"
        aria-label="Novo item na wishlist"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-5 z-30 flex items-center justify-center rounded-full bg-accent p-4 text-accent-contrast shadow-[0_6px_20px_-4px_rgba(0,0,0,0.4)] transition-colors hover:bg-accent-hover lg:bottom-8"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-20 text-faint">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando wishlist…
        </div>
      )}

      {erro && !loading && <p className="py-20 text-center text-sm text-red-500">Erro: {erro}</p>}

      {!loading && !erro && itensFiltrados.length === 0 && (
        <div className="py-20 text-center text-faint">
          {itens.length === 0 ? 'Nenhum item na wishlist ainda.' : 'Nenhum item encontrado para essa busca.'}
        </div>
      )}

      {!loading && !erro && itensFiltrados.length > 0 && (
        <>
          <p className="mb-3 text-xs tabular-nums text-faint">
            {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item' : 'itens'}
          </p>
          <div className="divide-y divide-border border-y border-border">
            {itensFiltrados.map((item) => (
              <WishlistItem key={item.id_wishlist} item={item} onToggleAdquirido={toggleAdquirido} onRemover={remover} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
