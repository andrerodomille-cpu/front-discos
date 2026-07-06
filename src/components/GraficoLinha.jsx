export default function GraficoLinha({ titulo, dados, formatarValor = (v) => v }) {
  const max = Math.max(...dados.map(([, valor]) => valor), 1)
  const pontos = dados.map(([, valor], i) => ({
    xPct: dados.length > 1 ? (i / (dados.length - 1)) * 100 : 50,
    yPct: 100 - (valor / max) * 100,
  }))
  const pathLinha = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.xPct},${p.yPct}`).join(' ')
  const pathArea = dados.length > 0 ? `${pathLinha} L100,100 L0,100 Z` : ''

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      ) : (
        <>
          <div className="relative w-full h-28">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <line x1="0" y1="100" x2="100" y2="100" stroke="var(--app-border)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
              <path d={pathArea} fill="var(--app-accent)" opacity="0.1" stroke="none" />
              <path
                d={pathLinha}
                fill="none"
                stroke="var(--app-accent)"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {pontos.map((p, i) => (
              <div
                key={i}
                title={`${dados[i][0]}: ${formatarValor(dados[i][1])}`}
                className="absolute w-2 h-2 rounded-full bg-accent border-2 border-surface -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between gap-1">
            {dados.map(([label, valor], i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 min-w-0">
                <span className="text-[11px] text-faint tabular-nums">{formatarValor(valor)}</span>
                <span className="text-[11px] text-muted truncate">{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
