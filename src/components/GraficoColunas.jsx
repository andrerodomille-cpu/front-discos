export default function GraficoColunas({ titulo, dados }) {
  const max = Math.max(...dados.map(([, valor]) => valor), 1)

  return (
    <section className="flex flex-col gap-3 border-t-2 border-border-strong pt-3">
      <h3 className="u-sec">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      ) : (
        <div className="flex items-end gap-2 sm:gap-3">
          {dados.map(([label, valor]) => (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="u-ident text-faint">{valor}</span>
              <div className="flex h-24 w-full items-end">
                <div
                  className="mx-auto w-full max-w-9 bg-accent transition-[height] duration-300"
                  style={{ height: `${Math.max((valor / max) * 100, 2)}%` }}
                />
              </div>
              <span className="max-w-full truncate text-[11px] text-muted">{label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
