import { Link } from 'react-router-dom'

export default function GraficoTimeline({ titulo, pontos }) {
  if (pontos.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-muted">{titulo}</h3>
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      </div>
    )
  }

  const anos = pontos.map((p) => p.ano)
  const min = Math.min(...anos)
  const max = Math.max(...anos)
  const intervalo = max - min || 1

  const porAno = {}
  pontos.forEach((p) => {
    porAno[p.ano] = porAno[p.ano] || []
    porAno[p.ano].push(p)
  })
  const anosUnicos = [...new Set(anos)].sort((a, b) => a - b)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-muted">{titulo}</h3>
      <div className="relative w-full h-16">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-border" />
        {pontos.map((p) => {
          const xPct = ((p.ano - min) / intervalo) * 100
          const indice = porAno[p.ano].indexOf(p)
          return (
            <Link
              key={p.id_disco}
              to={`/discos/${p.id_disco}`}
              title={`${p.titulo} (${p.ano})`}
              className="absolute w-2.5 h-2.5 rounded-full bg-accent hover:bg-accent-hover border-2 border-surface -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-125"
              style={{ left: `${xPct}%`, top: `calc(50% - ${indice * 9}px)` }}
            />
          )
        })}
      </div>
      <div className="flex justify-between gap-1">
        {anosUnicos.map((ano) => (
          <span key={ano} className="text-[11px] text-muted">
            {ano}
          </span>
        ))}
      </div>
    </div>
  )
}
