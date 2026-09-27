export function CheckoutSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-card border-brand-border h-40 animate-pulse rounded-[1.75rem] border"
          />
        ))}
      </div>
      <div className="bg-card border-brand-border h-104 animate-pulse rounded-[1.75rem] border" />
    </div>
  );
}
