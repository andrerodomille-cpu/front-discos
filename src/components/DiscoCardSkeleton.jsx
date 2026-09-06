export default function DiscoCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      <div className="u-sleeve aspect-square" />
      <div className="flex flex-1 flex-col gap-2 pt-2">
        <div className="h-3.5 w-4/5 rounded-[2px] bg-surface-2" />
        <div className="h-3 w-3/5 rounded-[2px] bg-surface-2" />
        <div className="mt-1 h-3 w-1/4 rounded-[2px] bg-surface-2" />
      </div>
    </div>
  )
}
