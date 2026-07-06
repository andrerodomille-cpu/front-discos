import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Disc3, Guitar, Music, Users, Clock, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import DashboardTile from '../components/DashboardTile'
import GraficoBarraHorizontal from '../components/GraficoBarraHorizontal'
import GraficoColunas from '../components/GraficoColunas'
import GraficoTimeline from '../components/GraficoTimeline'

function ranking(pares, limite = 8) {
  const contagem = {}
  pares.forEach((valor) => {
    if (valor) contagem[valor] = (contagem[valor] || 0) + 1
  })
  return Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, limite)
}

function contarPorDecada(discos) {
  const contagem = {}
  discos.forEach((d) => {
    if (d.ano_lancamento) {
      const decada = Math.floor(d.ano_lancamento / 10) * 10
      contagem[decada] = (contagem[decada] || 0) + 1
    }
  })
  return Object.entries(contagem)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([decada, qtd]) => [`${decada}s`, qtd])
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function DashboardMusicos() {
  const [discos, setDiscos] = useState([])
  const [audicoes, setAudicoes] = useState([])
  const [musicoSelecionado, setMusicoSelecionado] = useState('')
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

  const musicos = useMemo(() => {
    const mapa = {}
    discos.forEach((d) => {
      ;(d.musicos_ficha_tecnica || []).forEach((m) => {
        if (m.id_musico && m.musico_nome) {
          mapa[m.id_musico] = mapa[m.id_musico] || { id_musico: m.id_musico, nome: m.musico_nome, qtd: 0 }
          mapa[m.id_musico].qtd += 1
        }
      })
    })
    return Object.values(mapa).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
  }, [discos])

  useEffect(() => {
    if (!musicoSelecionado && musicos.length > 0) {
      const top = [...musicos].sort((a, b) => b.qtd - a.qtd)[0]
      setMusicoSelecionado(String(top.id_musico))
    }
  }, [musicos, musicoSelecionado])

  const nomeMusico = musicos.find((m) => String(m.id_musico) === musicoSelecionado)?.nome || ''

  const participacoes = useMemo(() => {
    const lista = []
    discos.forEach((d) => {
      ;(d.musicos_ficha_tecnica || []).forEach((m) => {
        if (String(m.id_musico) === musicoSelecionado) {
          lista.push({ disco: d, instrumento_nome: m.instrumento_nome, faixas: m.faixas })
        }
      })
    })
    return lista
  }, [discos, musicoSelecionado])

  const discosUnicos = useMemo(() => {
    const mapa = {}
    participacoes.forEach((p) => {
      mapa[p.disco.id_disco] = p.disco
    })
    return Object.values(mapa)
  }, [participacoes])

  const totalInstrumentos = useMemo(
    () => new Set(participacoes.map((p) => p.instrumento_nome).filter(Boolean)).size,
    [participacoes],
  )
  const totalArtistas = useMemo(
    () => new Set(discosUnicos.map((d) => d.artista_nome).filter(Boolean)).size,
    [discosUnicos],
  )

  const instrumentosTocados = useMemo(
    () => ranking(participacoes.map((p) => p.instrumento_nome)),
    [participacoes],
  )

  const artistasComQuemTrabalhou = useMemo(() => {
    const discosPorArtista = {}
    participacoes.forEach((p) => {
      const artista = p.disco.artista_nome
      if (!artista) return
      discosPorArtista[artista] = discosPorArtista[artista] || new Set()
      discosPorArtista[artista].add(p.disco.id_disco)
    })
    return Object.entries(discosPorArtista)
      .map(([nome, set]) => [nome, set.size])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [participacoes])

  const linhaDoTempo = useMemo(
    () =>
      discosUnicos
        .filter((d) => d.ano_lancamento)
        .map((d) => ({ ano: d.ano_lancamento, titulo: d.titulo, id_disco: d.id_disco })),
    [discosUnicos],
  )

  const parceirosMaisFrequentes = useMemo(() => {
    const discosPorParceiro = {}
    discosUnicos.forEach((d) => {
      const nomesNoDisco = new Set()
      ;(d.musicos_ficha_tecnica || []).forEach((m) => {
        if (m.musico_nome && String(m.id_musico) !== musicoSelecionado) nomesNoDisco.add(m.musico_nome)
      })
      nomesNoDisco.forEach((nome) => {
        discosPorParceiro[nome] = discosPorParceiro[nome] || new Set()
        discosPorParceiro[nome].add(d.id_disco)
      })
    })
    return Object.entries(discosPorParceiro)
      .map(([nome, set]) => [nome, set.size])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [discosUnicos, musicoSelecionado])

  const generos = useMemo(
    () => [...new Set(discosUnicos.map((d) => d.genero_nome).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [discosUnicos],
  )

  const porDecada = useMemo(() => contarPorDecada(discosUnicos), [discosUnicos])

  const ultimaAudicao = useMemo(() => {
    const ids = new Set(discosUnicos.map((d) => d.id_disco))
    const relevantes = audicoes.filter((a) => ids.has(a.id_disco))
    if (relevantes.length === 0) return null
    const maisRecente = relevantes.reduce((a, b) => (new Date(a.data_audicao) > new Date(b.data_audicao) ? a : b))
    const disco = discosUnicos.find((d) => d.id_disco === maisRecente.id_disco)
    return { audicao: maisRecente, disco }
  }, [discosUnicos, audicoes])

  const participacoesOrdenadas = useMemo(
    () => [...participacoes].sort((a, b) => (a.disco.ano_lancamento || Infinity) - (b.disco.ano_lancamento || Infinity)),
    [participacoes],
  )

  return (
    <div className="pb-16 sm:pb-14 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold mb-4">Dashboards</h1>
        <DashboardTabs />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-faint gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Carregando dashboards...
        </div>
      ) : erro ? (
        <p className="text-center py-20 text-red-500 text-sm">Erro ao carregar dados: {erro}</p>
      ) : musicos.length === 0 ? (
        <div className="text-center py-20 text-faint">Cadastre discos com ficha técnica para ver este dashboard.</div>
      ) : (
        <>
          <div>
            <label className="flex flex-col gap-1.5 text-sm max-w-sm">
              <span className="text-muted">Músico</span>
              <select
                value={musicoSelecionado}
                onChange={(e) => setMusicoSelecionado(e.target.value)}
                className="bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {musicos.map((m) => (
                  <option key={m.id_musico} value={m.id_musico}>
                    {m.nome} ({m.qtd} {m.qtd === 1 ? 'participação' : 'participações'})
                  </option>
                ))}
              </select>
            </label>
          </div>

          {nomeMusico && (
            <>
              <h2 className="text-lg font-semibold -mb-2">{nomeMusico}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <DashboardTile icon={Disc3} label="Discos" value={discosUnicos.length} />
                <DashboardTile icon={Guitar} label="Participações" value={participacoes.length} />
                <DashboardTile icon={Music} label="Instrumentos" value={totalInstrumentos} />
                <DashboardTile icon={Users} label="Artistas diferentes" value={totalArtistas} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GraficoBarraHorizontal titulo="Instrumentos tocados" dados={instrumentosTocados} />
                <GraficoBarraHorizontal titulo="Artistas com quem trabalhou" dados={artistasComQuemTrabalhou} />
              </div>

              <GraficoTimeline titulo="Linha do tempo" pontos={linhaDoTempo} />

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-muted">Participações</h3>
                <div className="border border-border rounded-xl overflow-x-auto bg-surface">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted border-b border-border">
                        <th className="px-3 py-2 font-medium">Álbum</th>
                        <th className="px-3 py-2 font-medium">Artista</th>
                        <th className="px-3 py-2 font-medium">Instrumento</th>
                        <th className="px-3 py-2 font-medium">Faixas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {participacoesOrdenadas.map((p, i) => (
                        <tr key={i} className="hover:bg-surface-2 transition-colors">
                          <td className="px-3 py-2 max-w-[12rem] truncate">
                            <Link to={`/discos/${p.disco.id_disco}`} className="hover:text-accent">
                              {p.disco.titulo}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-muted truncate max-w-[10rem]">{p.disco.artista_nome || '—'}</td>
                          <td className="px-3 py-2 text-muted">{p.instrumento_nome || '—'}</td>
                          <td className="px-3 py-2 text-muted">{p.faixas || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GraficoBarraHorizontal titulo="Parceiros mais frequentes" dados={parceirosMaisFrequentes} />
                <GraficoColunas titulo="Distribuição por década" dados={porDecada} />
              </div>

              <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-muted">Gêneros</h3>
                {generos.length === 0 ? (
                  <p className="text-xs text-faint">Sem dados suficientes.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {generos.map((g) => (
                      <span key={g} className="text-xs px-2.5 py-1 rounded-full border border-border-strong text-muted">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <Link
                to={ultimaAudicao ? `/discos/${ultimaAudicao.disco.id_disco}` : '/audicoes'}
                className="bg-surface border border-border rounded-xl p-3 flex items-center gap-3 hover:border-accent transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center overflow-hidden shrink-0">
                  {ultimaAudicao?.disco?.url_capa ? (
                    <img
                      src={ultimaAudicao.disco.url_capa}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Clock className="w-5 h-5 text-faint" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-muted mb-0.5">
                    <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-xs">Último disco ouvido</span>
                  </div>
                  {ultimaAudicao ? (
                    <>
                      <p className="text-sm font-semibold truncate">{ultimaAudicao.disco?.titulo || 'Disco removido'}</p>
                      <p className="text-xs text-muted truncate">{formatarData(ultimaAudicao.audicao.data_audicao)}</p>
                    </>
                  ) : (
                    <p className="text-sm text-faint">Nenhum disco desse músico foi ouvido ainda.</p>
                  )}
                </div>
              </Link>
            </>
          )}
        </>
      )}
    </div>
  )
}
