export default function DiscoCardSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-surface-2" />
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="h-3.5 bg-surface-2 rounded w-4/5" />
        <div className="h-3 bg-surface-2 rounded w-3/5" />
        <div className="mt-auto h-3 bg-surface-2 rounded w-1/4" />
      </div>
    </div>
  )
}
