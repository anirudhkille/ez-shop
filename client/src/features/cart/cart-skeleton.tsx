/** Mirrors the filled-cart layout so the page does not jump when data lands. */
export default function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3" aria-busy>
      <div className="space-y-4 lg:col-span-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-card border-brand-border flex animate-pulse gap-4 rounded-2xl border p-4"
          >
            <div className="bg-muted-foreground/20 size-24 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-3 py-1">
              <div className="bg-muted-foreground/20 h-4 w-2/3 rounded" />
              <div className="bg-muted-foreground/20 h-3 w-1/3 rounded" />
              <div className="bg-muted-foreground/20 h-8 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-card border-brand-border animate-pulse rounded-2xl border p-6">
          <div className="bg-muted-foreground/20 mb-6 h-6 w-32 rounded" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-muted-foreground/20 h-4 rounded" />
            ))}
          </div>
          <div className="bg-muted-foreground/20 mt-6 h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
