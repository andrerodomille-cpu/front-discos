export default function DiscoListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
      <div className="w-11 h-11 rounded bg-surface-2 shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="h-3.5 bg-surface-2 rounded w-2/5" />
        <div className="h-3 bg-surface-2 rounded w-1/4" />
      </div>
      <div className="hidden sm:block h-3 bg-surface-2 rounded w-24 shrink-0" />
      <div className="hidden md:block h-3 bg-surface-2 rounded w-24 shrink-0" />
      <div className="h-3 bg-surface-2 rounded w-8 shrink-0" />
    </div>
  )
}
