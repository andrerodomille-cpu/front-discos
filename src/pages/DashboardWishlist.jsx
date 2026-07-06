import { useEffect, useMemo, useState } from 'react'
import { Heart, TrendingDown, Scale, TrendingUp, Search, Store, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import DashboardTile from '../components/DashboardTile'
import GraficoBarraHorizontal from '../components/GraficoBarraHorizontal'
import GraficoLinha from '../components/GraficoLinha'

function formatarValor(valor) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarValorCompacto(valor) {
  return `R$${Math.round(valor)}`
}

// Todos os preços pesquisados (de todos os itens), achatados numa lista só.
function todosOsPrecos(itens) {
  const precos = []
  itens.forEach((item) => {
    ;(item.historico_precos || []).forEach((p) => {
      if (p.valor === null || p.valor === undefined) return
      precos.push({ valor: Number(p.valor), loja_nome: p.loja_nome, titulo: item.titulo })
    })
  })
  return precos
}

function itemMaisPesquisado(itens) {
  let melhor = null
  itens.forEach((item) => {
    const qtd = (item.historico_precos || []).length
    if (qtd > 0 && (!melhor || qtd > melhor.qtd)) melhor = { item, qtd }
  })
  return melhor
}

function lojaComMelhoresPrecos(precos) {
  const soma = {}
  const qtd = {}
  precos.forEach((p) => {
    if (!p.loja_nome) return
    soma[p.loja_nome] = (soma[p.loja_nome] || 0) + p.valor
    qtd[p.loja_nome] = (qtd[p.loja_nome] || 0) + 1
  })
  let melhor = null
  Object.keys(soma).forEach((loja) => {
    const media = soma[loja] / qtd[loja]
    if (!melhor || media < melhor.media) melhor = { loja, media }
  })
  return melhor
}

function precoAoLongoDoTempo(item) {
  if (!item) return []
  const precos = [...(item.historico_precos || [])]
    .filter((p) => p.valor !== null && p.valor !== undefined && p.data_pesquisa)
    .sort((a, b) => new Date(a.data_pesquisa) - new Date(b.data_pesquisa))
  const anos = new Set(precos.map((p) => new Date(p.data_pesquisa).getFullYear()))
  const multiAno = anos.size > 1
  return precos.map((p) => {
    const d = new Date(p.data_pesquisa)
    const label = d.toLocaleDateString('pt-BR', multiAno ? { day: '2-digit', month: '2-digit', year: '2-digit' } : { day: '2-digit', month: '2-digit' })
    return [label, Number(p.valor)]
  })
}

function contarPorArtista(itens, limite = 8) {
  const contagem = {}
  itens.forEach((item) => {
    if (item.artista_nome) contagem[item.artista_nome] = (contagem[item.artista_nome] || 0) + 1
  })
  return Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, limite)
}

function contarPorLoja(precos, limite = 8) {
  const contagem = {}
  precos.forEach((p) => {
    if (p.loja_nome) contagem[p.loja_nome] = (contagem[p.loja_nome] || 0) + 1
  })
  const entradas = Object.entries(contagem).sort((a, b) => b[1] - a[1])
  if (entradas.length <= limite) return entradas
  const top = entradas.slice(0, limite)
  const outros = entradas.slice(limite).reduce((soma, [, v]) => soma + v, 0)
  return outros > 0 ? [...top, ['Outros', outros]] : top
}

function discosMaisCaros(itens, limite = 8) {
  return itens
    .map((item) => {
      const precos = (item.historico_precos || [])
        .map((p) => Number(p.valor))
        .filter((v) => !Number.isNaN(v))
      if (precos.length === 0) return null
      return [item.titulo, Math.min(...precos)]
    })
    .filter(Boolean)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
}

export default function DashboardWishlist() {
  const [itens, setItens] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)
    api
      .get('/wishlist')
      .then((res) => setItens(res.data.filter((item) => !item.adquirido)))
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [])

  const precos = useMemo(() => todosOsPrecos(itens), [itens])
  const valorMinimo = useMemo(() => (precos.length > 0 ? precos.reduce((a, b) => (a.valor < b.valor ? a : b)) : null), [precos])
  const valorMaximo = useMemo(() => (precos.length > 0 ? precos.reduce((a, b) => (a.valor > b.valor ? a : b)) : null), [precos])
  const valorMedio = useMemo(() => (precos.length > 0 ? precos.reduce((s, p) => s + p.valor, 0) / precos.length : null), [precos])
  const maisPesquisado = useMemo(() => itemMaisPesquisado(itens), [itens])
  const melhorLoja = useMemo(() => lojaComMelhoresPrecos(precos), [precos])

  const precoNoTempo = useMemo(() => precoAoLongoDoTempo(maisPesquisado?.item), [maisPesquisado])
  const porArtista = useMemo(() => contarPorArtista(itens), [itens])
  const porLoja = useMemo(() => contarPorLoja(precos), [precos])
  const maisCaros = useMemo(() => discosMaisCaros(itens), [itens])

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
      ) : itens.length === 0 ? (
        <div className="text-center py-20 text-faint">Adicione itens à wishlist para ver este dashboard.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <DashboardTile icon={Heart} label="Total de discos desejados" value={itens.length} />
            <DashboardTile
              icon={TrendingDown}
              label="Valor mínimo encontrado"
              value={formatarValor(valorMinimo?.valor)}
              title={valorMinimo ? `${valorMinimo.titulo}${valorMinimo.loja_nome ? ` — ${valorMinimo.loja_nome}` : ''}` : ''}
            />
            <DashboardTile icon={Scale} label="Valor médio" value={formatarValor(valorMedio)} />
            <DashboardTile
              icon={TrendingUp}
              label="Valor máximo"
              value={formatarValor(valorMaximo?.valor)}
              title={valorMaximo ? `${valorMaximo.titulo}${valorMaximo.loja_nome ? ` — ${valorMaximo.loja_nome}` : ''}` : ''}
            />
            <DashboardTile
              icon={Search}
              label="Disco mais procurado"
              value={maisPesquisado ? maisPesquisado.item.titulo : '—'}
              title={maisPesquisado ? `${maisPesquisado.qtd} preços pesquisados` : ''}
            />
            <DashboardTile
              icon={Store}
              label="Loja com melhores preços"
              value={melhorLoja ? melhorLoja.loja : '—'}
              title={melhorLoja ? `Média de ${formatarValor(melhorLoja.media)}` : ''}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GraficoLinha
              titulo={maisPesquisado ? `Preço ao longo do tempo — ${maisPesquisado.item.titulo}` : 'Preço ao longo do tempo'}
              dados={precoNoTempo}
              formatarValor={formatarValorCompacto}
            />
            <GraficoBarraHorizontal titulo="Quantidade de desejos por artista" dados={porArtista} />
            <GraficoBarraHorizontal titulo="Lojas onde os discos apareceram" dados={porLoja} />
            <GraficoBarraHorizontal titulo="Discos mais caros da wishlist" dados={maisCaros} formatarValor={formatarValorCompacto} />
          </div>
        </>
      )}
    </div>
  )
}
