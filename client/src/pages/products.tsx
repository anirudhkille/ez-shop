import { Activity, useEffect, useMemo, useRef, useState } from "react";

import { useSearchParams } from "react-router";

import { ChevronDown, Settings2, X } from "lucide-react";

import { buildFilterParams } from "@/lib/buildFilterParams";
import { cn } from "@/lib/utils";

import { useCategorys } from "@/hooks/useCategory";
import { useFilteredProducts } from "@/hooks/useProduct";

import EmptyState from "@/features/product/empty-state";
import FilterDrawer from "@/features/product/filter-drawer";
import FilterSidebar, {
  defaultFilters,
  type FilterState,
} from "@/features/product/filter-sidebar";
import ProductCard from "@/features/product/product-card";
import ProductSkeleton from "@/features/product/product-skleton";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

function countActiveFilters(f: FilterState) {
  return (
    f.categories.length +
    f.sizes.length +
    f.colors.length +
    (f.minRating > 0 ? 1 : 0) +
    (f.priceRange[1] < 300 ? 1 : 0)
  );
}

export default function Products() {
  const { data: categories } = useCategorys();
  const [q] = useSearchParams();
  const category = q.get("category");
  const [sortBy, setSortBy] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories?.forEach((cat: any) => {
      map[cat._id] = cat.name;
    });
    return map;
  }, [categories]);

  const queryParams = useMemo(
    () => ({
      ...buildFilterParams(filters, sortBy),
      limit: 12,
    }),
    [filters, sortBy]
  );
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useFilteredProducts(queryParams);

  const products = data?.pages.flatMap((page: any) => page.data) ?? [];

  const activeFilterCount = countActiveFilters(filters);

  const activeSort = SORT_OPTIONS.find((o) => o.value === sortBy)!;

  const selectedCategoryLabel = useMemo(() => {
    if (!category) return "All";

    const matchedCategory = categories?.find(
      (cat: any) =>
        cat._id === category ||
        cat.slug === category ||
        cat.name.toLowerCase() === category.toLowerCase()
    );

    return matchedCategory?.name ?? category;
  }, [categories, category]);

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  // Active filter chips (for inline display)
  const activeChips: { label: string; onRemove: () => void }[] = [
    ...filters.categories.map((c) => ({
      label: categoryMap[c] || c,
      onRemove: () =>
        setFilters((f) => ({
          ...f,
          categories: f.categories.filter((x) => x !== c),
        })),
    })),
    ...filters.colors.map((c) => ({
      label: c,
      onRemove: () =>
        setFilters((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) })),
    })),
    ...filters.sizes.map((s) => ({
      label: `Size ${s}`,
      onRemove: () =>
        setFilters((f) => ({ ...f, sizes: f.sizes.filter((x) => x !== s) })),
    })),
    ...(filters.minRating > 0
      ? [
          {
            label: `${filters.minRating}★ & up`,
            onRemove: () => setFilters((f) => ({ ...f, minRating: 0 })),
          },
        ]
      : []),
    ...(filters.priceRange[1] < 300
      ? [
          {
            label: `≤$${filters.priceRange[1]}`,
            onRemove: () => setFilters((f) => ({ ...f, priceRange: [0, 300] })),
          },
        ]
      : []),
  ];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  useEffect(() => {
    if (!categories) return;

    if (!category) {
      setFilters((prev) =>
        prev.categories.length === 0
          ? prev
          : {
              ...prev,
              categories: [],
            }
      );
      return;
    }

    const matchedCategory = categories.find(
      (cat: any) =>
        cat._id === category ||
        cat.slug === category ||
        cat.name.toLowerCase() === category.toLowerCase()
    );

    setFilters((prev) => ({
      ...prev,
      categories: matchedCategory?._id ? [matchedCategory._id] : [],
    }));
  }, [categories, category]);

  return (
    <main className="mx-auto mt-16 max-w-360 border px-4 py-10 sm:px-6 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="text-foreground font-body text-lg font-semibold uppercase md:text-xl">
          {selectedCategoryLabel} Styles (
          {(data?.pages[0] as any)?.pagination?.total ?? 0})
        </span>{" "}
        <div className="lg:hidden">
          <FilterDrawer
            filters={filters}
            onApply={setFilters}
            activeCount={activeFilterCount}
          />
        </div>
        <div className="relative hidden gap-5 lg:flex">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="border-brand-border bg-card font-body text-foreground hover:border-brand-orange/40 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all"
          >
            {showFilter ? "Hide" : "Show"} Filters
            <Settings2 size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="border-brand-border bg-card font-body text-foreground hover:border-brand-orange/40 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-all"
          >
            <span className="text-muted-foreground hidden sm:inline">
              Sort:{" "}
            </span>
            <span className="font-semibold">{activeSort.label}</span>
            <ChevronDown
              size={14}
              className={cn(
                "text-muted-foreground transition-transform duration-200",
                sortOpen && "rotate-180"
              )}
            />
          </button>
          {sortOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSortOpen(false)}
              />
              <div className="border-brand-border bg-card animate-fade-in-up absolute top-full right-0 z-20 mt-2 w-52 rounded-2xl border p-1.5 shadow-(--shadow-card)">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortOpen(false);
                    }}
                    className={cn(
                      "font-body flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all",
                      sortBy === opt.value
                        ? "bg-brand-orange/10 text-brand-orange font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.value && (
                      <div className="bg-brand-orange h-1.5 w-1.5 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex items-start gap-8">
        <Activity mode={showFilter ? "visible" : "hidden"}>
          <div className="sticky top-24 hidden max-h-[calc(100vh-7rem)] self-start overflow-y-auto lg:block">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onClear={handleClearFilters}
              activeCount={activeFilterCount}
            />
          </div>
        </Activity>

        {/* ── Right column ── */}
        <div className="min-w-0 flex-1">
          {activeChips.length > 0 && (
            <div className="animate-fade-in-up mb-5 flex flex-wrap gap-2">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="border-brand-orange/40 bg-brand-orange/10 font-body text-brand-orange flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    className="transition-colors hover:text-white"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearFilters}
                className="border-brand-border font-body text-muted-foreground hover:border-brand-orange/40 hover:text-foreground rounded-full border px-3 py-1 text-xs transition-all"
              >
                Clear all
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-5">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState handleClearFilters={handleClearFilters} />
          ) : (
            <div
              className={`grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-5 ${!showFilter ? "xl:grid-cols-4" : ""}`}
            >
              {products.map((product: any, i: number) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  delay={i * 50}
                />
              ))}
            </div>
          )}
          {isFetchingNextPage && (
            <div className="py-4 text-center">Loading more...</div>
          )}
        </div>
      </div>
    </main>
  );
}
