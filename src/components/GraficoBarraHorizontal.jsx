export default function GraficoBarraHorizontal({ titulo, dados, sufixo = '', formatarValor }) {
  const max = Math.max(...dados.map(([, valor]) => valor), 1)

  return (
    <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
      <h3 className="u-sec">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {dados.map(([label, valor]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 truncate text-xs text-muted sm:w-28" title={label}>
                {label}
              </span>
              <div className="h-4 flex-1 bg-surface-2">
                <div
                  className="h-full bg-accent transition-[width] duration-300"
                  style={{ width: `${Math.max((valor / max) * 100, 1.5)}%` }}
                />
              </div>
              <span className="u-ident w-14 shrink-0 text-right text-faint">
                {formatarValor ? formatarValor(valor) : `${valor}${sufixo}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
