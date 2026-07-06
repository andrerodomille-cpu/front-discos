export default function GraficoColunas({ titulo, dados }) {
  const max = Math.max(...dados.map(([, valor]) => valor), 1)

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted">{titulo}</h3>
      {dados.length === 0 ? (
        <p className="text-xs text-faint">Sem dados suficientes.</p>
      ) : (
        <div className="flex items-end gap-2 sm:gap-3">
          {dados.map(([label, valor]) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[11px] text-faint tabular-nums">{valor}</span>
              <div className="w-full h-24 flex items-end">
                <div
                  className="w-full max-w-8 mx-auto bg-accent rounded-t transition-all"
                  style={{ height: `${(valor / max) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-muted truncate max-w-full">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
