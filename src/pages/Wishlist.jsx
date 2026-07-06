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
    <div className="pb-16 sm:pb-14">
      <div className="mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, artista, gênero, formato..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <Link
        to="/wishlist/novo"
        title="Novo item na wishlist"
        aria-label="Novo item na wishlist"
        className="fixed z-30 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-contrast p-4 rounded-full shadow-lg shadow-black/30"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {loading && (
        <div className="flex items-center justify-center py-20 text-faint gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando wishlist...
        </div>
      )}

      {erro && !loading && <p className="text-center py-20 text-red-500 text-sm">Erro: {erro}</p>}

      {!loading && !erro && itensFiltrados.length === 0 && (
        <div className="text-center py-20 text-faint">
          {itens.length === 0 ? 'Nenhum item na wishlist ainda.' : 'Nenhum item encontrado para essa busca.'}
        </div>
      )}

      {!loading && !erro && itensFiltrados.length > 0 && (
        <>
          <p className="text-sm text-faint mb-3">
            {itensFiltrados.length} {itensFiltrados.length === 1 ? 'item' : 'itens'}
          </p>
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface">
            {itensFiltrados.map((item) => (
              <WishlistItem key={item.id_wishlist} item={item} onToggleAdquirido={toggleAdquirido} onRemover={remover} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
