import { PackageSearch } from "lucide-react";

type EmptyStateProps = {
  handleClearFilters: () => void;
};

export default function EmptyState({ handleClearFilters }: EmptyStateProps) {
  return (
    <div className="border-brand-border bg-card animate-fade-in-up flex flex-col items-center justify-center gap-6 rounded-3xl border py-24 text-center">
      <div className="bg-brand-surface-raised flex h-20 w-20 items-center justify-center rounded-full">
        <PackageSearch size={36} className="text-muted-foreground/50" />
      </div>
      <div>
        <p className="font-display text-foreground text-3xl font-bold tracking-wider uppercase">
          No Products Found
        </p>
        <p className="font-body text-muted-foreground mt-2 text-sm">
          Try adjusting your filters or clearing your search.
        </p>
      </div>
      <button
        onClick={handleClearFilters}
        className="bg-brand-orange font-body rounded-full px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
      >
        Clear Filters
      </button>
    </div>
  );
}
