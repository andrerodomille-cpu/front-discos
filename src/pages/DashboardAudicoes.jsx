import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, Star, Repeat, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import GraficoColunas from '../components/GraficoColunas'
import GraficoLinha from '../components/GraficoLinha'

const NOMES_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function ranking(audicoes, obterChave, obterRotulo, limite = 8) {
  const contagem = {}
  const rotulos = {}
  audicoes.forEach((a) => {
    const chave = obterChave(a)
    if (!chave) return
    contagem[chave] = (contagem[chave] || 0) + 1
    rotulos[chave] = obterRotulo(a)
  })
  return Object.entries(contagem)
    .map(([chave, valor]) => [rotulos[chave], valor])
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
}

function contarPorMes(audicoes) {
  const contagem = new Array(12).fill(0)
  audicoes.forEach((a) => {
    contagem[new Date(a.data_audicao).getMonth()] += 1
  })
  return NOMES_MESES.map((nome, i) => [nome, contagem[i]])
}

function contarPorAno(audicoes) {
  const contagem = {}
  audicoes.forEach((a) => {
    const ano = new Date(a.data_audicao).getFullYear()
    contagem[ano] = (contagem[ano] || 0) + 1
  })
  return Object.entries(contagem)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([ano, qtd]) => [ano, qtd])
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function contarPorDisco(audicoes) {
  const contagem = {}
  audicoes.forEach((a) => {
    if (a.id_disco) contagem[a.id_disco] = (contagem[a.id_disco] || 0) + 1
  })
  return contagem
}

function CardRanking({ item, posicao }) {
  const conteudo = (
    <>
      <div className="relative aspect-square w-full overflow-hidden rounded-[2px] bg-surface-2 flex items-center justify-center">
        {item.capa ? (
          <img
            src={item.capa}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <Disc3 className="h-8 w-8 text-faint" />
        )}
        <span className="absolute left-1.5 top-1.5 rounded-[2px] bg-black/70 px-1.5 py-0.5 text-xs font-semibold text-white">
          #{posicao}
        </span>
      </div>
      <div className="mt-2 min-w-0">
        <p className="truncate font-display text-sm font-semibold tracking-[-0.01em]">{item.titulo}</p>
        {item.subtitulo && <p className="truncate text-xs text-muted">{item.subtitulo}</p>}
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <Repeat className="h-3.5 w-3.5" /> {item.qtd} {item.qtd === 1 ? 'audição' : 'audições'}
        </p>
      </div>
    </>
  )
  const classe = 'block rounded-[2px] border border-border bg-surface p-2 transition-colors hover:bg-surface-2'
  return item.to ? (
    <Link to={item.to} className={classe}>
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}

function SecaoCards({ titulo, itens }) {
  return (
    <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
      <h2 className="u-sec">{titulo}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {itens.map((item, i) => (
          <CardRanking key={item.id} item={item} posicao={i + 1} />
        ))}
      </div>
    </section>
  )
}

export default function DashboardAudicoes() {
  const [audicoes, setAudicoes] = useState([])
  const [discos, setDiscos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)
    Promise.all([api.get('/audicoes'), api.get('/discos')])
      .then(([audicoesRes, discosRes]) => {
        setAudicoes(audicoesRes.data)
        setDiscos(discosRes.data)
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [])

  const capaPorDisco = useMemo(() => {
    const mapa = {}
    discos.forEach((d) => {
      mapa[d.id_disco] = d.url_capa
    })
    return mapa
  }, [discos])

  const discosMaisOuvidos = useMemo(() => {
    const contagem = {}
    audicoes.forEach((a) => {
      if (!a.id_disco) return
      if (!contagem[a.id_disco]) {
        contagem[a.id_disco] = {
          id: a.id_disco,
          titulo: a.disco_titulo || 'Disco removido',
          subtitulo: a.artista_nome,
          capa: capaPorDisco[a.id_disco] || null,
          qtd: 0,
        }
      }
      contagem[a.id_disco].qtd += 1
    })
    return Object.values(contagem)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 8)
      .map((d) => ({ ...d, to: `/discos/${d.id}` }))
  }, [audicoes, capaPorDisco])

  const artistasMaisOuvidos = useMemo(() => {
    const contagem = {}
    audicoes.forEach((a) => {
      if (!a.artista_nome) return
      if (!contagem[a.artista_nome]) {
        contagem[a.artista_nome] = { id: a.artista_nome, titulo: a.artista_nome, capa: null, qtd: 0 }
      }
      const c = contagem[a.artista_nome]
      c.qtd += 1
      if (!c.capa && capaPorDisco[a.id_disco]) c.capa = capaPorDisco[a.id_disco]
    })
    return Object.values(contagem)
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 8)
  }, [audicoes, capaPorDisco])
  const audicoesPorMes = useMemo(() => contarPorMes(audicoes), [audicoes])
  const evolucaoPorAno = useMemo(() => contarPorAno(audicoes), [audicoes])
  const contagemPorDisco = useMemo(() => contarPorDisco(audicoes), [audicoes])

  const ultimasAudicoes = useMemo(() => {
    return audicoes.slice(0, 10).map((a) => ({
      ...a,
      url_capa: discos.find((d) => d.id_disco === a.id_disco)?.url_capa || null,
      vezesOuvido: contagemPorDisco[a.id_disco] || 1,
    }))
  }, [audicoes, discos, contagemPorDisco])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-faint gap-2">
        <Loader2 className="w-5 h-5 animate-spin" /> Carregando dashboards...
      </div>
    )
  }

  if (erro) {
    return <p className="text-center py-20 text-red-500 text-sm">Erro ao carregar dados: {erro}</p>
  }

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div>
        <h1 className="mb-4 text-2xl">Dashboards</h1>
        <DashboardTabs />
      </div>

      {audicoes.length === 0 ? (
        <div className="py-20 text-center text-faint">Registre audições para ver este dashboard.</div>
      ) : (
        <>
          <SecaoCards titulo="Discos mais ouvidos" itens={discosMaisOuvidos} />
          <SecaoCards titulo="Artistas mais ouvidos" itens={artistasMaisOuvidos} />

          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">
            <GraficoColunas titulo="Audições por mês" dados={audicoesPorMes} />
            <GraficoLinha titulo="Evolução das audições ao longo dos anos" dados={evolucaoPorAno} />
          </div>

          <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
            <h2 className="u-sec">Últimos discos ouvidos</h2>
            <div className="divide-y divide-border border-y border-border">
              {ultimasAudicoes.map((a) => (
                <Link
                  key={a.id_audicao}
                  to={a.id_disco ? `/discos/${a.id_disco}` : '/audicoes'}
                  className="u-spine flex items-center gap-3 py-2.5 pl-4 pr-3 transition-colors hover:bg-surface-2"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[2px] bg-surface-2">
                    {a.url_capa ? (
                      <img
                        src={a.url_capa}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Disc3 className="h-5 w-5 text-faint" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold tracking-[-0.01em]">
                      {a.disco_titulo || 'Disco removido'}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {[a.artista_nome, formatarData(a.data_audicao)].filter(Boolean).join('  ·  ')}
                    </p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted" title="Vezes ouvido">
                    <Repeat className="h-3.5 w-3.5" /> {a.vezesOuvido}×
                  </span>
                  {a.nota ? (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-500" /> {a.nota}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
