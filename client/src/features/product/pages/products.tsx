import { useInfiniteScroll } from "@/shared/hooks/use-infinite-scroll";

import { ActiveFilterChips } from "../components/active-filter-chips";
import { EmptyState } from "../components/empty-state";
import { FilterSidebar } from "../components/filter-sidebar";
import { ProductCard } from "../components/product-card";
import { ProductSkeleton } from "../components/product-skleton";
import { ProductToolbar } from "../components/product-toolbar";
import { useProductFilters } from "../hooks/use-product-filters";

export default function Products() {
  const {
    filters,
    setFilters,
    clearFilters,
    sortBy,
    setSortBy,
    sortOpen,
    setSortOpen,
    showFilter,
    setShowFilter,
    products,
    total,
    isLoading,
    activeFilterCount,
    activeSort,
    selectedCategoryLabel,
    chips,
    fetchNextPage,
    canLoadMore,
  } = useProductFilters();

  const loadMoreRef = useInfiniteScroll(fetchNextPage, canLoadMore);

  const selectSort = (value: string) => {
    setSortBy(value);
    setSortOpen(false);
  };

  return (
    <main className="mx-auto mt-16 max-w-360 border px-4 py-10 sm:px-6 lg:px-10">
      <ProductToolbar
        heading={selectedCategoryLabel}
        total={total}
        filters={filters}
        onApply={setFilters}
        activeCount={activeFilterCount}
        showFilter={showFilter}
        onToggleFilter={() => setShowFilter(!showFilter)}
        sortBy={sortBy}
        sortOpen={sortOpen}
        onToggleSort={() => setSortOpen(!sortOpen)}
        onSelectSort={selectSort}
        activeSortLabel={activeSort.label}
      />

      <div className="flex items-start gap-8">
        <div className={showFilter ? "hidden lg:block" : "hidden"}>
          <div className="scrollbar-hide sticky top-24 self-start">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClear={clearFilters}
              activeCount={activeFilterCount}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <ActiveFilterChips chips={chips} onClearAll={clearFilters} />

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-5">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState handleClearFilters={clearFilters} />
          ) : (
            <div
              className={`grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-5 ${!showFilter ? "xl:grid-cols-4" : ""}`}
            >
              {products.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  delay={i * 50}
                />
              ))}
            </div>
          )}

          {!isLoading && (
            <div ref={loadMoreRef} className="h-4 w-full" aria-hidden="true" />
          )}
        </div>
      </div>
    </main>
  );
}
