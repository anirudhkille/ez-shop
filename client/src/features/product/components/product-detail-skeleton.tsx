export default function ProductDetailSkeleton() {
  return (
    <main className="pt-20">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-12 px-6 pb-20 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <div className="flex flex-col gap-4">
          <div className="bg-brand-surface-raised aspect-square animate-pulse rounded-3xl" />
          <div className="flex gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-brand-surface-raised h-20 w-20 shrink-0 animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <div className="bg-brand-surface-raised h-3 w-24 animate-pulse rounded-full" />
          <div className="bg-brand-surface-raised h-12 w-3/4 animate-pulse rounded-xl" />
          <div className="bg-brand-surface-raised h-4 w-32 animate-pulse rounded-full" />
          <div className="bg-brand-surface-raised h-10 w-40 animate-pulse rounded-xl" />
          <div className="space-y-2">
            <div className="bg-brand-surface-raised h-3 w-full animate-pulse rounded-full" />
            <div className="bg-brand-surface-raised h-3 w-5/6 animate-pulse rounded-full" />
            <div className="bg-brand-surface-raised h-3 w-4/6 animate-pulse rounded-full" />
          </div>
          <div className="mt-4 flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-brand-surface-raised h-9 w-9 animate-pulse rounded-full"
              />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-brand-surface-raised h-10 w-12 animate-pulse rounded-lg"
              />
            ))}
          </div>
          <div className="bg-brand-surface-raised mt-4 h-12 w-full animate-pulse rounded-xl" />
        </div>
      </div>
    </main>
  );
}
