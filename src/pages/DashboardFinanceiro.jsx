import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, TrendingDown, Percent, Disc3, ShoppingCart, Target, Store, Loader2 } from 'lucide-react'
import api from '../api/client'
import DashboardTabs from '../components/DashboardTabs'
import DashboardTile from '../components/DashboardTile'
import GraficoBarraHorizontal from '../components/GraficoBarraHorizontal'
import GraficoColunas from '../components/GraficoColunas'

function formatarValor(valor) {
  if (valor === null || valor === undefined) return '—'
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcularEstatisticas(discos) {
  const comValorPago = discos.filter((d) => d.valor_pago !== null && d.valor_pago !== undefined && d.valor_pago !== '')
  const comValorEstimado = discos.filter((d) => d.valor_estimado !== null && d.valor_estimado !== undefined && d.valor_estimado !== '')

  const valorPagoTotal = comValorPago.reduce((soma, d) => soma + Number(d.valor_pago), 0)
  const valorEstimadoTotal = comValorEstimado.reduce((soma, d) => soma + Number(d.valor_estimado), 0)

  const valorizacao = valorPagoTotal > 0 ? ((valorEstimadoTotal - valorPagoTotal) / valorPagoTotal) * 100 : null

  const maisCaro = comValorEstimado.length > 0
    ? comValorEstimado.reduce((a, b) => (Number(a.valor_estimado) > Number(b.valor_estimado) ? a : b))
    : null

  const valorMedio = comValorPago.length > 0 ? valorPagoTotal / comValorPago.length : 0

  const maiorCompra = comValorPago.length > 0
    ? comValorPago.reduce((a, b) => (Number(a.valor_pago) > Number(b.valor_pago) ? a : b))
    : null

  const contagemLojas = {}
  discos.forEach((d) => {
    if (d.loja_nome) contagemLojas[d.loja_nome] = (contagemLojas[d.loja_nome] || 0) + 1
  })
  const lojasOrdenadas = Object.entries(contagemLojas).sort((a, b) => b[1] - a[1])
  const lojaTop = lojasOrdenadas.length > 0 ? lojasOrdenadas[0] : null

  return { valorPagoTotal, valorEstimadoTotal, valorizacao, maisCaro, valorMedio, maiorCompra, lojaTop }
}

function valorPorAno(discos) {
  const somas = {}
  discos.forEach((d) => {
    if (d.data_compra && d.valor_pago) {
      const ano = new Date(d.data_compra).getFullYear()
      somas[ano] = (somas[ano] || 0) + Number(d.valor_pago)
    }
  })
  return Object.entries(somas)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([ano, soma]) => [ano, Math.round(soma)])
}

function comprasPorLoja(discos, limite = 8) {
  const contagem = {}
  discos.forEach((d) => {
    if (d.loja_nome) contagem[d.loja_nome] = (contagem[d.loja_nome] || 0) + 1
  })
  const entradas = Object.entries(contagem).sort((a, b) => b[1] - a[1])
  if (entradas.length <= limite) return entradas
  const top = entradas.slice(0, limite)
  const outros = entradas.slice(limite).reduce((soma, [, v]) => soma + v, 0)
  return outros > 0 ? [...top, ['Outros', outros]] : top
}

function distribuicaoPorFormato(discos) {
  const contagem = {}
  discos.forEach((d) => {
    if (d.formato_nome) contagem[d.formato_nome] = (contagem[d.formato_nome] || 0) + 1
  })
  const total = Object.values(contagem).reduce((soma, v) => soma + v, 0)
  if (total === 0) return []
  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .map(([nome, qtd]) => [nome, Math.round((qtd / total) * 100)])
}

function topDiscosValiosos(discos, limite = 20) {
  return discos
    .filter((d) => d.valor_estimado !== null && d.valor_estimado !== undefined && d.valor_estimado !== '')
    .sort((a, b) => Number(b.valor_estimado) - Number(a.valor_estimado))
    .slice(0, limite)
}

export default function DashboardFinanceiro() {
  const [discos, setDiscos] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)
    api
      .get('/discos')
      .then((res) => setDiscos(res.data))
      .catch((err) => setErro(err.response?.data?.error || err.message))
      .finally(() => setLoading(false))
  }, [])

  const estatisticas = useMemo(() => calcularEstatisticas(discos), [discos])
  const porAno = useMemo(() => valorPorAno(discos), [discos])
  const porLoja = useMemo(() => comprasPorLoja(discos), [discos])
  const porFormato = useMemo(() => distribuicaoPorFormato(discos), [discos])
  const topValiosos = useMemo(() => topDiscosValiosos(discos), [discos])

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
        <div className="text-center py-20 text-faint">Cadastre discos para ver o dashboard financeiro.</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <DashboardTile icon={Wallet} label="Valor pago pela coleção" value={formatarValor(estatisticas.valorPagoTotal)} />
            <DashboardTile icon={TrendingUp} label="Valor estimado atual" value={formatarValor(estatisticas.valorEstimadoTotal)} />
            <DashboardTile
              icon={estatisticas.valorizacao !== null && estatisticas.valorizacao < 0 ? TrendingDown : Percent}
              label="Valorização"
              value={estatisticas.valorizacao !== null ? `${estatisticas.valorizacao >= 0 ? '+' : ''}${estatisticas.valorizacao.toFixed(1)}%` : '—'}
              valueClassName={
                estatisticas.valorizacao === null
                  ? ''
                  : estatisticas.valorizacao >= 0
                    ? 'text-emerald-500'
                    : 'text-red-500'
              }
            />
            <DashboardTile
              icon={Disc3}
              label="Disco mais caro"
              value={estatisticas.maisCaro ? formatarValor(estatisticas.maisCaro.valor_estimado) : '—'}
              title={estatisticas.maisCaro?.titulo || ''}
            />
            <DashboardTile icon={ShoppingCart} label="Valor médio por disco" value={formatarValor(estatisticas.valorMedio)} />
            <DashboardTile
              icon={Target}
              label="Maior compra"
              value={estatisticas.maiorCompra ? formatarValor(estatisticas.maiorCompra.valor_pago) : '—'}
              title={estatisticas.maiorCompra?.titulo || ''}
            />
            <DashboardTile
              icon={Store}
              label="Loja onde mais comprou"
              value={estatisticas.lojaTop ? estatisticas.lojaTop[0] : '—'}
              title={estatisticas.lojaTop ? `${estatisticas.lojaTop[1]} compras` : ''}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GraficoColunas titulo="Valor investido por ano (R$)" dados={porAno} />
            <GraficoBarraHorizontal titulo="Compras por loja" dados={porLoja} />
            <GraficoBarraHorizontal titulo="Distribuição por formato" dados={porFormato} sufixo="%" />
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted">Top {topValiosos.length} discos mais valiosos</h2>
            <div className="border border-border rounded-xl overflow-x-auto bg-surface">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted border-b border-border">
                    <th className="px-3 py-2 font-medium">Álbum</th>
                    <th className="px-3 py-2 font-medium text-right">Pago</th>
                    <th className="px-3 py-2 font-medium text-right">Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topValiosos.map((d) => (
                    <tr key={d.id_disco} className="hover:bg-surface-2 transition-colors">
                      <td className="px-3 py-2 max-w-[16rem] truncate">
                        <Link to={`/discos/${d.id_disco}`} className="hover:text-accent">
                          {d.titulo}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right text-muted tabular-nums">{formatarValor(d.valor_pago)}</td>
                      <td className="px-3 py-2 text-right font-medium tabular-nums">{formatarValor(d.valor_estimado)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
