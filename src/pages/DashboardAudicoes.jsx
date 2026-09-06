import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, Star, Repeat, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import GraficoBarraHorizontal from '../components/GraficoBarraHorizontal'
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

  const discosMaisOuvidos = useMemo(
    () => ranking(audicoes, (a) => a.id_disco, (a) => a.disco_titulo || 'Disco removido'),
    [audicoes],
  )
  const artistasMaisOuvidos = useMemo(
    () => ranking(audicoes, (a) => a.artista_nome, (a) => a.artista_nome),
    [audicoes],
  )
  const audicoesPorMes = useMemo(() => contarPorMes(audicoes), [audicoes])
  const evolucaoPorAno = useMemo(() => contarPorAno(audicoes), [audicoes])
  const contagemPorDisco = useMemo(() => contarPorDisco(audicoes), [audicoes])

  const ultimasAudicoes = useMemo(() => {
    return audicoes.slice(0, 5).map((a) => ({
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
          <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">
            <GraficoBarraHorizontal titulo="Discos mais ouvidos" dados={discosMaisOuvidos} />
            <GraficoBarraHorizontal titulo="Artistas mais ouvidos" dados={artistasMaisOuvidos} />
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
