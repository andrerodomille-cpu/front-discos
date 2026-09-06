import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, Clock, Star, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import DashboardTile from '../components/DashboardTile'
import GraficoBarraHorizontal from '../components/GraficoBarraHorizontal'

function paraRanking(itens, campo) {
  const contagem = {}
  itens.forEach((item) => {
    const valor = item[campo]
    if (valor) contagem[valor] = (contagem[valor] || 0) + 1
  })
  return Object.entries(contagem).sort((a, b) => b[1] - a[1])
}

function tempoRelativo(data) {
  if (!data) return 'Nunca ouvido'
  const dias = Math.floor((Date.now() - new Date(data).getTime()) / (1000 * 60 * 60 * 24))
  if (dias < 1) return 'Hoje'
  if (dias === 1) return 'Ontem'
  if (dias < 30) return `Há ${dias} dias`
  const meses = Math.floor(dias / 30)
  if (meses < 12) return `Há ${meses} ${meses === 1 ? 'mês' : 'meses'}`
  const anos = Math.floor(meses / 12)
  return `Há ${anos} ${anos === 1 ? 'ano' : 'anos'}`
}

export default function DashboardArtistas() {
  const [discos, setDiscos] = useState([])
  const [audicoes, setAudicoes] = useState([])
  const [artistaSelecionado, setArtistaSelecionado] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)
    Promise.all([api.get('/discos'), api.get('/audicoes')])
      .then(([discosRes, audicoesRes]) => {
        setDiscos(discosRes.data)
        setAudicoes(audicoesRes.data)
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [])

  const artistas = useMemo(() => {
    const mapa = {}
    discos.forEach((d) => {
      if (d.id_artista && d.artista_nome) {
        mapa[d.id_artista] = mapa[d.id_artista] || { id_artista: d.id_artista, nome: d.artista_nome, qtd: 0 }
        mapa[d.id_artista].qtd += 1
      }
    })
    return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [discos])

  useEffect(() => {
    if (!artistaSelecionado && artistas.length > 0) {
      const top = [...artistas].sort((a, b) => b.qtd - a.qtd)[0]
      setArtistaSelecionado(String(top.id_artista))
    }
  }, [artistas, artistaSelecionado])

  const discosDoArtista = useMemo(
    () => discos.filter((d) => String(d.id_artista) === artistaSelecionado),
    [discos, artistaSelecionado],
  )

  const nomeArtista = discosDoArtista[0]?.artista_nome || ''

  const ordemCronologica = useMemo(
    () => [...discosDoArtista].sort((a, b) => (a.ano_lancamento || Infinity) - (b.ano_lancamento || Infinity)),
    [discosDoArtista],
  )

  const porGravadora = useMemo(() => paraRanking(discosDoArtista, 'gravadora_nome'), [discosDoArtista])
  const porGenero = useMemo(() => paraRanking(discosDoArtista, 'genero_nome'), [discosDoArtista])

  const musicos = useMemo(() => {
    const mapa = {}
    discosDoArtista.forEach((d) => {
      ;(d.musicos_ficha_tecnica || []).forEach((m) => {
        if (!m.musico_nome) return
        if (!mapa[m.musico_nome]) mapa[m.musico_nome] = new Set()
        if (m.instrumento_nome) mapa[m.musico_nome].add(m.instrumento_nome)
      })
    })
    return Object.entries(mapa)
      .map(([nome, instrumentos]) => [nome, [...instrumentos].join(', ')])
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [discosDoArtista])

  const mediaAvaliacoes = useMemo(() => {
    const comNota = discosDoArtista.filter((d) => d.avaliacao !== null && d.avaliacao !== undefined && d.avaliacao !== '')
    if (comNota.length === 0) return null
    return comNota.reduce((soma, d) => soma + Number(d.avaliacao), 0) / comNota.length
  }, [discosDoArtista])

  const ultimaAudicao = useMemo(() => {
    const idsDiscos = new Set(discosDoArtista.map((d) => d.id_disco))
    const doArtista = audicoes.filter((a) => idsDiscos.has(a.id_disco))
    if (doArtista.length === 0) return null
    return doArtista.reduce((a, b) => (new Date(a.data_audicao) > new Date(b.data_audicao) ? a : b))
  }, [discosDoArtista, audicoes])

  return (
    <div className="flex flex-col gap-8 pb-16">
      <div>
        <h1 className="mb-4 text-2xl">Dashboards</h1>
        <DashboardTabs />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-faint">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando dashboards…
        </div>
      ) : erro ? (
        <p className="py-20 text-center text-sm text-red-500">Erro ao carregar dados: {erro}</p>
      ) : artistas.length === 0 ? (
        <div className="py-20 text-center text-faint">Cadastre discos com artista para ver este dashboard.</div>
      ) : (
        <>
          <div>
            <label className="flex max-w-sm flex-col gap-1.5 text-sm">
              <span className="text-muted">Artista</span>
              <select
                value={artistaSelecionado}
                onChange={(e) => setArtistaSelecionado(e.target.value)}
                className="u-field"
              >
                {artistas.map((a) => (
                  <option key={a.id_artista} value={a.id_artista}>
                    {a.nome} ({a.qtd} {a.qtd === 1 ? 'disco' : 'discos'})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {nomeArtista && (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3">
                <DashboardTile icon={Disc3} label="Quantidade de discos" value={discosDoArtista.length} />
                <DashboardTile
                  icon={Clock}
                  label="Última audição"
                  value={ultimaAudicao ? tempoRelativo(ultimaAudicao.data_audicao) : 'Nunca ouvido'}
                  title={ultimaAudicao?.disco_titulo || ''}
                />
                <DashboardTile
                  icon={Star}
                  label="Média das avaliações"
                  value={mediaAvaliacoes !== null ? mediaAvaliacoes.toFixed(1) : '—'}
                />
              </div>

              <div className="grid grid-cols-1 gap-x-8 gap-y-8 lg:grid-cols-2">
                <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
                  <h3 className="u-sec">Ordem cronológica</h3>
                  <div className="flex flex-col divide-y divide-border">
                    {ordemCronologica.map((d) => (
                      <Link
                        key={d.id_disco}
                        to={`/discos/${d.id_disco}`}
                        className="flex items-center gap-3 py-2 transition-colors hover:text-accent"
                      >
                        <span className="w-10 shrink-0 text-xs tabular-nums text-faint">{d.ano_lancamento || '—'}</span>
                        <span className="truncate text-sm">{d.titulo}</span>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
                  <h3 className="u-sec">Músicos participantes</h3>
                  {musicos.length === 0 ? (
                    <p className="text-xs text-faint">Nenhum músico registrado na ficha técnica.</p>
                  ) : (
                    <div className="u-credits">
                      {musicos.map(([nome, instrumentos]) => (
                        <div key={nome} className="u-credit">
                          <span className="k text-foreground">{nome}</span>
                          <span className="fill" />
                          <span className="v">{instrumentos || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <GraficoBarraHorizontal titulo="Gravadoras" dados={porGravadora} />
                <GraficoBarraHorizontal titulo="Gêneros" dados={porGenero} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
