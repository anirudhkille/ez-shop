export default function ProductSkeleton() {
  return (
    <div className="border-brand-border bg-card animate-pulse overflow-hidden rounded-2xl border">
      <div className="bg-brand-surface-raised aspect-square" />
      <div className="space-y-3 p-4">
        <div className="bg-muted h-3 w-16 rounded" />
        <div className="bg-muted h-5 w-3/4 rounded" />
        <div className="flex items-center justify-between">
          <div className="bg-muted h-4 w-20 rounded" />
          <div className="bg-muted h-6 w-14 rounded" />
        </div>
        <div className="flex gap-1.5 pt-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted h-4 w-4 rounded-full" />
          ))}
        </div>
        <div className="bg-muted mt-2 h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}
