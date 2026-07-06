export default function GraficoBarraHorizontal({ titulo, dados, sufixo = '', formatarValor }) {
  const max = Math.max(...dados.map(([, valor]) => valor), 1)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {dados.map(([label, valor]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-muted w-20 sm:w-28 shrink-0 truncate" title={label}>
                {label}
              </span>
              <div className="flex-1 h-5 bg-surface-2 rounded-r overflow-hidden">
                <div
                  className="h-full bg-accent rounded-r transition-all"
                  style={{ width: `${(valor / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-faint w-14 text-right shrink-0 tabular-nums">
                {formatarValor ? formatarValor(valor) : `${valor}${sufixo}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
