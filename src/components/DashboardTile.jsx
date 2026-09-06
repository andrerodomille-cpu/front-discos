export default function DashboardTile({ icon: Icon, label, value, title, valueClassName = '' }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-t-2 border-border-strong pt-2">
      <div className="flex items-center gap-1.5 text-muted">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-faint" />}
        <span className="truncate text-xs">{label}</span>
      </div>
      <span
        className={`font-display text-2xl font-bold tracking-[-0.02em] tabular-nums truncate ${valueClassName}`}
        title={title || ''}
      >
        {value}
      </span>
    </div>
  )
}
