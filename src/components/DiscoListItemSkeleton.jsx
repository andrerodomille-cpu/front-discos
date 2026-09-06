export default function DiscoListItemSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 py-2.5 pl-4 pr-3">
      <div className="h-3 w-[28%] shrink-0 rounded-[2px] bg-surface-2" />
      <div className="h-3 w-2/5 rounded-[2px] bg-surface-2" />
      <div className="ml-auto hidden h-3 w-24 shrink-0 rounded-[2px] bg-surface-2 md:block" />
      <div className="h-3 w-8 shrink-0 rounded-[2px] bg-surface-2" />
    </div>
  )
}
