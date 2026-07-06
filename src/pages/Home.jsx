import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, LayoutGrid, List, Disc3, Wallet, Mic2 } from 'lucide-react'
import api from '../api/client'
import DiscoCard from '../components/DiscoCard'
import DiscoListItem from '../components/DiscoListItem'
import DiscoCardSkeleton from '../components/DiscoCardSkeleton'
import DiscoListItemSkeleton from '../components/DiscoListItemSkeleton'

function visualizacaoInicial() {
  const salva = localStorage.getItem('visualizacaoDiscos')
  return salva === 'lista' ? 'lista' : 'cards'
}

function compararDiscos(a, b, ordenacao) {
  switch (ordenacao) {
    case 'titulo':
      return a.titulo.localeCompare(b.titulo, 'pt-BR')
    case 'artista':
      return (a.artista_nome || '').localeCompare(b.artista_nome || '', 'pt-BR')
    case 'ano_desc':
      return (b.ano_lancamento || 0) - (a.ano_lancamento || 0)
    case 'ano_asc':
      return (a.ano_lancamento || 0) - (b.ano_lancamento || 0)
    case 'avaliacao':
      return (b.avaliacao || 0) - (a.avaliacao || 0)
    default:
      return b.id_disco - a.id_disco
  }
}

function calcularEstatisticas(discos) {
  const total = discos.length
  const valorInvestido = discos.reduce((soma, d) => soma + (Number(d.valor_pago) || 0), 0)

  const contagemArtistas = {}
  discos.forEach((d) => {
    if (d.artista_nome) contagemArtistas[d.artista_nome] = (contagemArtistas[d.artista_nome] || 0) + 1
  })
  let artistaTop = null
  let maxContagem = 0
  for (const [nome, contagem] of Object.entries(contagemArtistas)) {
    if (contagem > maxContagem) {
      artistaTop = nome
      maxContagem = contagem
    }
  }

  return { total, valorInvestido, artistaTop }
}

export default function Home() {
  const [discos, setDiscos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')
  const [visualizacao, setVisualizacao] = useState(visualizacaoInicial)
  const [ordenacao, setOrdenacao] = useState('recentes')
  const [filtroGenero, setFiltroGenero] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('')

  useEffect(() => {
    localStorage.setItem('visualizacaoDiscos', visualizacao)
  }, [visualizacao])

  useEffect(() => {
    let ativo = true
    setLoading(true)
    setErro(null)
    api
      .get('/discos')
      .then((res) => {
        if (ativo) setDiscos(res.data)
      })
      .catch((err) => {
        if (ativo) setErro(err.response?.data?.error || err.message)
      })
      .finally(() => {
        if (ativo) setLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  const generos = useMemo(
    () => [...new Set(discos.map((d) => d.genero_nome).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [discos],
  )
  const formatos = useMemo(
    () => [...new Set(discos.map((d) => d.formato_nome).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [discos],
  )

  const estatisticas = useMemo(() => calcularEstatisticas(discos), [discos])

  const discosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return discos
      .filter((d) => !filtroGenero || d.genero_nome === filtroGenero)
      .filter((d) => !filtroFormato || d.formato_nome === filtroFormato)
      .filter((d) => {
        if (!termo) return true
        return [d.titulo, d.artista_nome, d.genero_nome, d.gravadora_nome, d.formato_nome]
          .filter(Boolean)
          .some((campo) => campo.toLowerCase().includes(termo))
      })
      .sort((a, b) => compararDiscos(a, b, ordenacao))
  }, [discos, busca, filtroGenero, filtroFormato, ordenacao])

  const selectClass =
    'bg-surface border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-accent flex-1 sm:flex-none min-w-0'

  return (
    <div className="pb-16 sm:pb-14">
      {!loading && !erro && discos.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-muted">
              <Disc3 className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs truncate">Discos</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold truncate">{estatisticas.total}</span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-muted">
              <Wallet className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs truncate">Investido</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold truncate">
              {estatisticas.valorInvestido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1.5 text-muted">
              <Mic2 className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="text-xs truncate">Top artista</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold truncate" title={estatisticas.artistaTop || ''}>
              {estatisticas.artistaTop || '—'}
            </span>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, artista, gênero, gravadora..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      <Link
        to="/discos/novo"
        title="Novo disco"
        aria-label="Novo disco"
        className="fixed z-30 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-6 flex items-center justify-center bg-accent hover:bg-accent-hover text-accent-contrast p-4 rounded-full shadow-lg shadow-black/30"
      >
        <Plus className="w-6 h-6" />
      </Link>

      {loading && (
        <div>
          {visualizacao === 'cards' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <DiscoCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface">
              {Array.from({ length: 8 }).map((_, i) => (
                <DiscoListItemSkeleton key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {erro && !loading && (
        <div className="text-center py-20 text-red-500 text-sm">
          Erro ao carregar discos: {erro}.<br />
          Verifique o endereço da API em{' '}
          <Link to="/configuracoes" className="underline">
            Configurações
          </Link>
          .
        </div>
      )}

      {!loading && !erro && discos.length === 0 && (
        <div className="text-center py-20 text-faint">Nenhum disco cadastrado ainda.</div>
      )}

      {!loading && !erro && discos.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className={selectClass}>
              <option value="recentes">Mais recentes</option>
              <option value="titulo">Título (A-Z)</option>
              <option value="artista">Artista (A-Z)</option>
              <option value="ano_desc">Ano (mais novo)</option>
              <option value="ano_asc">Ano (mais antigo)</option>
              <option value="avaliacao">Avaliação</option>
            </select>
            <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} className={selectClass}>
              <option value="">Todos os gêneros</option>
              {generos.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select value={filtroFormato} onChange={(e) => setFiltroFormato(e.target.value)} className={selectClass}>
              <option value="">Todos os formatos</option>
              {formatos.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            <div className="flex gap-1 ml-auto">
              <button
                type="button"
                onClick={() => setVisualizacao('cards')}
                title="Ver em cards"
                aria-label="Ver em cards"
                className={`p-1.5 rounded-lg border transition-colors ${
                  visualizacao === 'cards'
                    ? 'bg-accent text-accent-contrast border-accent'
                    : 'border-border-strong text-muted hover:border-accent hover:text-accent'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setVisualizacao('lista')}
                title="Ver em lista"
                aria-label="Ver em lista"
                className={`p-1.5 rounded-lg border transition-colors ${
                  visualizacao === 'lista'
                    ? 'bg-accent text-accent-contrast border-accent'
                    : 'border-border-strong text-muted hover:border-accent hover:text-accent'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-faint mb-3">
            {discosFiltrados.length} {discosFiltrados.length === 1 ? 'disco' : 'discos'}
          </p>

          {discosFiltrados.length === 0 ? (
            <div className="text-center py-20 text-faint">Nenhum disco encontrado para esses filtros.</div>
          ) : visualizacao === 'cards' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {discosFiltrados.map((disco) => (
                <DiscoCard key={disco.id_disco} disco={disco} />
              ))}
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border overflow-hidden bg-surface">
              {discosFiltrados.map((disco) => (
                <DiscoListItem key={disco.id_disco} disco={disco} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
