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

const textoOuVazio = (v) => v || ''
const numeroOuNulo = (v) => (v === null || v === undefined || v === '' ? null : Number(v))
const dataOuNulo = (v) => (v ? new Date(v).getTime() : null)

// campo: extrai o valor; dir: 1 crescente, -1 decrescente; texto: compara como string
const ORDENACOES = {
  recentes: { label: 'Cadastrados recentemente', campo: (d) => d.id_disco, dir: -1 },
  titulo: { label: 'Título (A–Z)', campo: (d) => textoOuVazio(d.titulo), dir: 1, texto: true },
  artista: { label: 'Artista (A–Z)', campo: (d) => textoOuVazio(d.artista_nome), dir: 1, texto: true },
  lancamento_desc: { label: 'Lançamento (mais novo)', campo: (d) => numeroOuNulo(d.ano_lancamento), dir: -1 },
  lancamento_asc: { label: 'Lançamento (mais antigo)', campo: (d) => numeroOuNulo(d.ano_lancamento), dir: 1 },
  prensagem_desc: { label: 'Prensagem (mais nova)', campo: (d) => numeroOuNulo(d.ano_prensagem), dir: -1 },
  prensagem_asc: { label: 'Prensagem (mais antiga)', campo: (d) => numeroOuNulo(d.ano_prensagem), dir: 1 },
  compra_desc: { label: 'Compra (mais recente)', campo: (d) => dataOuNulo(d.data_compra), dir: -1 },
  compra_asc: { label: 'Compra (mais antiga)', campo: (d) => dataOuNulo(d.data_compra), dir: 1 },
  valor_pago_desc: { label: 'Valor pago (maior)', campo: (d) => numeroOuNulo(d.valor_pago), dir: -1 },
  valor_pago_asc: { label: 'Valor pago (menor)', campo: (d) => numeroOuNulo(d.valor_pago), dir: 1 },
  valor_estimado_desc: { label: 'Valor estimado (maior)', campo: (d) => numeroOuNulo(d.valor_estimado), dir: -1 },
  valor_estimado_asc: { label: 'Valor estimado (menor)', campo: (d) => numeroOuNulo(d.valor_estimado), dir: 1 },
  avaliacao: { label: 'Avaliação (maior)', campo: (d) => numeroOuNulo(d.avaliacao), dir: -1 },
}

function ordenacaoInicial() {
  const salva = localStorage.getItem('ordenacaoDiscos')
  return ORDENACOES[salva] ? salva : 'recentes'
}

// Discos sem o valor informado vão sempre para o fim; empate desempata por título
function compararDiscos(a, b, ordenacao) {
  const { campo, dir, texto } = ORDENACOES[ordenacao] || ORDENACOES.recentes
  const va = campo(a)
  const vb = campo(b)
  const aVazio = va === null || va === ''
  const bVazio = vb === null || vb === ''
  if (aVazio !== bVazio) return aVazio ? 1 : -1
  const cmp = aVazio ? 0 : texto ? va.localeCompare(vb, 'pt-BR') : va - vb
  return cmp * dir || a.titulo.localeCompare(b.titulo, 'pt-BR')
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
  const [ordenacao, setOrdenacao] = useState(ordenacaoInicial)
  const [filtroGenero, setFiltroGenero] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('')
  const [audicoes, setAudicoes] = useState([])
  const [animou, setAnimou] = useState(false)

  useEffect(() => {
    localStorage.setItem('visualizacaoDiscos', visualizacao)
  }, [visualizacao])

  useEffect(() => {
    localStorage.setItem('ordenacaoDiscos', ordenacao)
  }, [ordenacao])

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
              {Object.entries(ORDENACOES).map(([valor, { label }]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
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
