import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, LayoutGrid, List, Headphones, Star } from 'lucide-react'
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

function formatarDataAudicao(data) {
  return new Date(data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function contarAudicoesRecentes(audicoes) {
  const limite = Date.now() - 30 * 24 * 60 * 60 * 1000
  return audicoes.filter((a) => new Date(a.data_audicao).getTime() >= limite).length
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
  const [audicoes, setAudicoes] = useState([])
  const [animou, setAnimou] = useState(false)

  useEffect(() => {
    localStorage.setItem('visualizacaoDiscos', visualizacao)
  }, [visualizacao])

  useEffect(() => {
    api
      .get('/audicoes')
      .then((res) => setAudicoes(res.data))
      .catch(() => {})
  }, [])

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
        setTimeout(() => ativo && setAnimou(true), 900)
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

  const ultimaAudicao = audicoes.length > 0 ? audicoes[0] : null
  const audicoesRecentes = useMemo(() => contarAudicoesRecentes(audicoes), [audicoes])

  const capaUltimaAudicao = useMemo(() => {
    if (!ultimaAudicao) return null
    return discos.find((d) => d.id_disco === ultimaAudicao.id_disco)?.url_capa || null
  }, [discos, ultimaAudicao])

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

  const selectClass = 'u-field w-full text-sm sm:w-auto sm:flex-1 sm:min-w-[8rem]'
  const temColecao = !loading && !erro && discos.length > 0
  const revealCls = !animou ? 'u-reveal' : ''

  return (
    <div className="pb-16">
      <header className="mb-7">
        <h1 className="text-[clamp(1.9rem,5vw,2.6rem)]">A Coleção</h1>
        {temColecao && (
          <p className="mt-1.5 text-sm text-muted">
            <span className="font-display text-base font-bold tracking-[-0.02em] text-foreground tabular-nums">
              {discos.length}
            </span>{' '}
            {discos.length === 1 ? 'disco' : 'discos'} no acervo
            {audicoesRecentes > 0 && (
              <>
                {' · '}
                <span className="font-display text-base font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {audicoesRecentes}
                </span>{' '}
                ouvido{audicoesRecentes === 1 ? '' : 's'} em 30 dias
              </>
            )}
          </p>
        )}
      </header>

      {temColecao && ultimaAudicao && (
        <Link
          to="/audicoes"
          className="u-spine mb-7 flex items-center gap-4 border-y border-border py-3 pl-4 pr-2 transition-colors hover:bg-surface-2"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-surface-2">
            {capaUltimaAudicao ? (
              <img
                src={capaUltimaAudicao}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <Headphones className="h-5 w-5 text-faint" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-0.5 text-[11px] text-faint">Ouvido por último</p>
            <p className="truncate font-display font-semibold tracking-[-0.01em]">
              {ultimaAudicao.disco_titulo || 'Disco removido'}
            </p>
            <p className="truncate text-xs text-muted">
              {[ultimaAudicao.artista_nome, formatarDataAudicao(ultimaAudicao.data_audicao), ultimaAudicao.local]
                .filter(Boolean)
                .join('  ·  ')}
            </p>
          </div>
          {ultimaAudicao?.nota ? (
            <span className="flex shrink-0 items-center gap-1 pr-2 text-xs text-amber-500">
              <Star className="h-3.5 w-3.5 fill-amber-500" /> {ultimaAudicao.nota}
            </span>
          ) : null}
        </Link>
      )}

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título, artista, gênero, gravadora…"
          className="u-field pl-9"
        />
      </div>

      <Link
        to="/discos/novo"
        title="Novo disco"
        aria-label="Novo disco"
        className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-5 z-30 flex items-center justify-center rounded-full bg-accent p-4 text-accent-contrast shadow-[0_6px_20px_-4px_rgba(0,0,0,0.4)] transition-colors hover:bg-accent-hover lg:bottom-8"
      >
        <Plus className="h-6 w-6" />
      </Link>

      {loading &&
        (visualizacao === 'cards' ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <DiscoCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <DiscoListItemSkeleton key={i} />
            ))}
          </div>
        ))}

      {erro && !loading && (
        <div className="py-20 text-center text-sm text-red-500">
          Erro ao carregar discos: {erro}.
          <br />
          Verifique o endereço da API em{' '}
          <Link to="/configuracoes" className="underline">
            Configurações
          </Link>
          .
        </div>
      )}

      {!loading && !erro && discos.length === 0 && (
        <div className="py-20 text-center text-faint">Nenhum disco cadastrado ainda. Toque em + para começar.</div>
      )}

      {temColecao && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <select value={ordenacao} onChange={(e) => setOrdenacao(e.target.value)} className={selectClass}>
              <option value="recentes">Mais recentes</option>
              <option value="titulo">Título (A–Z)</option>
              <option value="artista">Artista (A–Z)</option>
              <option value="ano_desc">Ano (mais novo)</option>
              <option value="ano_asc">Ano (mais antigo)</option>
              <option value="avaliacao">Avaliação</option>
            </select>
            <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} className={selectClass}>
              <option value="">Todos os gêneros</option>
              {generos.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select value={filtroFormato} onChange={(e) => setFiltroFormato(e.target.value)} className={selectClass}>
              <option value="">Todos os formatos</option>
              {formatos.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <div className="ml-auto flex gap-1">
              <button
                type="button"
                onClick={() => setVisualizacao('cards')}
                title="Ver em capas"
                aria-label="Ver em capas"
                className={`rounded-[3px] border p-2 transition-colors ${
                  visualizacao === 'cards'
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-border-strong text-muted hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setVisualizacao('lista')}
                title="Ver em lombadas"
                aria-label="Ver em lombadas"
                className={`rounded-[3px] border p-2 transition-colors ${
                  visualizacao === 'lista'
                    ? 'border-accent bg-accent text-accent-contrast'
                    : 'border-border-strong text-muted hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mb-4 text-xs text-faint tabular-nums">
            {discosFiltrados.length} {discosFiltrados.length === 1 ? 'disco' : 'discos'}
          </p>

          {discosFiltrados.length === 0 ? (
            <div className="py-20 text-center text-faint">Nenhum disco encontrado para esses filtros.</div>
          ) : visualizacao === 'cards' ? (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 ${revealCls}`}>
              {discosFiltrados.map((disco, i) => (
                <div key={disco.id_disco} style={{ '--i': Math.min(i, 24) }}>
                  <DiscoCard disco={disco} />
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border border-y border-border">
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
