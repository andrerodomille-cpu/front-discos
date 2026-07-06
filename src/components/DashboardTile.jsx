export default function DashboardTile({ icon: Icon, label, value, title, valueClassName = '' }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1.5 text-muted">
        <Icon className="w-3.5 h-3.5 text-accent shrink-0" />
        <span className="text-xs truncate">{label}</span>
      </div>
      <span className={`text-lg sm:text-xl font-semibold truncate ${valueClassName}`} title={title || ''}>
        {value}
      </span>
    </div>
  )
}
