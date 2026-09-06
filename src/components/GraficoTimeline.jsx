import { Link } from 'react-router-dom'

export default function GraficoTimeline({ titulo, pontos }) {
  if (pontos.length === 0) {
    return (
      <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
        <h3 className="u-sec">{titulo}</h3>
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      </section>
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
    <section className="flex flex-col gap-4 border-t-2 border-border-strong pt-3">
      <h3 className="u-sec">{titulo}</h3>
      <div className="relative h-16 w-full">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border-strong" />
        {pontos.map((p) => {
          const xPct = ((p.ano - min) / intervalo) * 100
          const indice = porAno[p.ano].indexOf(p)
          return (
            <Link
              key={p.id_disco}
              to={`/discos/${p.id_disco}`}
              title={`${p.titulo} (${p.ano})`}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 border-2 border-surface bg-accent transition-colors hover:bg-accent-hover"
              style={{ left: `${xPct}%`, top: `calc(50% - ${indice * 9}px)` }}
            />
          )
        })}
      </div>
      <div className="flex justify-between gap-1">
        {anosUnicos.map((ano) => (
          <span key={ano} className="u-ident text-muted">
            {ano}
          </span>
        ))}
      </div>
    </section>
  )
}
