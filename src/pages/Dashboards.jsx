import { useEffect, useMemo, useState } from 'react'
import { Disc3, Disc, Mic2, Building2, Tag, Users, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import DashboardTile from '../components/DashboardTile'
import GraficoBarraHorizontal from '../components/GraficoBarraHorizontal'
import GraficoColunas from '../components/GraficoColunas'
import GraficoLinha from '../components/GraficoLinha'

function contarPor(discos, campo) {
  const contagem = {}
  discos.forEach((d) => {
    const valor = d[campo]
    if (valor) contagem[valor] = (contagem[valor] || 0) + 1
  })
  return contagem
}

function paraRanking(contagem, limite = 8) {
  const entradas = Object.entries(contagem).sort((a, b) => b[1] - a[1])
  if (entradas.length <= limite) return entradas
  const top = entradas.slice(0, limite)
  const outros = entradas.slice(limite).reduce((soma, [, v]) => soma + v, 0)
  return outros > 0 ? [...top, ['Outros', outros]] : top
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

function contarEntradasPorAno(discos) {
  const contagem = {}
  discos.forEach((d) => {
    if (d.data_compra) {
      const ano = new Date(d.data_compra).getFullYear()
      contagem[ano] = (contagem[ano] || 0) + 1
    }
  })
  return Object.entries(contagem)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([ano, qtd]) => [ano, qtd])
}

// CD/Vinil são deduzidos do nome do formato cadastrado (ex: "Vinil 33 RPM", "CD"),
// já que não há uma classificação fixa de formatos no banco.
function classificarFormato(nome) {
  const n = (nome || '').toLowerCase()
  if (n.includes('cd')) return 'cd'
  if (n.includes('vinil') || n.includes('lp') || n.includes('compacto') || n.includes('rpm')) return 'vinil'
  return null
}

function calcularEstatisticas(discos, totalMusicos) {
  const totalDiscos = discos.length
  const totalCDs = discos.filter((d) => classificarFormato(d.formato_nome) === 'cd').length
  const totalVinis = discos.filter((d) => classificarFormato(d.formato_nome) === 'vinil').length

  const totalArtistas = new Set(discos.filter((d) => d.id_artista).map((d) => d.id_artista)).size
  const totalGravadoras = new Set(discos.filter((d) => d.id_gravadora).map((d) => d.id_gravadora)).size
  const totalGeneros = new Set(discos.filter((d) => d.id_genero).map((d) => d.id_genero)).size

  return { totalDiscos, totalCDs, totalVinis, totalArtistas, totalGravadoras, totalGeneros, totalMusicos }
}

export default function Dashboards() {
  const [discos, setDiscos] = useState([])
  const [totalMusicos, setTotalMusicos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)
    Promise.all([api.get('/discos'), api.get('/musicos')])
      .then(([discosRes, musicosRes]) => {
        setDiscos(discosRes.data)
        setTotalMusicos(musicosRes.data.length)
      })
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [])

  const estatisticas = useMemo(() => calcularEstatisticas(discos, totalMusicos), [discos, totalMusicos])

  const porDecada = useMemo(() => contarPorDecada(discos), [discos])
  const porGenero = useMemo(() => paraRanking(contarPor(discos, 'genero_nome')), [discos])
  const porGravadora = useMemo(() => paraRanking(contarPor(discos, 'gravadora_nome')), [discos])
  const porPais = useMemo(() => paraRanking(contarPor(discos, 'pais_origem')), [discos])
  const linhaDoTempo = useMemo(() => contarEntradasPorAno(discos), [discos])

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
      ) : discos.length === 0 ? (
        <div className="text-center py-20 text-faint">Cadastre discos para ver os dashboards.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <DashboardTile icon={Disc3} label="Total de discos" value={estatisticas.totalDiscos} />
            <DashboardTile icon={Disc} label="Total de CDs" value={estatisticas.totalCDs} />
            <DashboardTile icon={Disc3} label="Total de vinis" value={estatisticas.totalVinis} />
            <DashboardTile icon={Mic2} label="Total de artistas" value={estatisticas.totalArtistas} />
            <DashboardTile icon={Building2} label="Total de gravadoras" value={estatisticas.totalGravadoras} />
            <DashboardTile icon={Tag} label="Total de gêneros" value={estatisticas.totalGeneros} />
            <DashboardTile icon={Users} label="Total de músicos cadastrados" value={estatisticas.totalMusicos} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GraficoColunas titulo="Discos por década" dados={porDecada} />
            <GraficoBarraHorizontal titulo="Discos por gênero" dados={porGenero} />
            <GraficoBarraHorizontal titulo="Discos por país" dados={porPais} />
            <GraficoBarraHorizontal titulo="Quantidade por gravadora" dados={porGravadora} />
            <GraficoLinha titulo="Linha do tempo da coleção" dados={linhaDoTempo} />
          </div>
        </>
      )}
    </div>
  )
}
