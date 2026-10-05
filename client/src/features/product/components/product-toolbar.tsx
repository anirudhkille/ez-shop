import { ChevronDown, Settings2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { SORT_OPTIONS } from "../hooks/use-product-filters";
import type { FilterState } from "../lib/filters";
import { FilterDrawer } from "./filter-drawer";

interface ProductToolbarProps {
  heading: string;
  total: number;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  activeCount: number;
  showFilter: boolean;
  onToggleFilter: () => void;
  sortBy: string;
  sortOpen: boolean;
  onToggleSort: () => void;
  onSelectSort: (value: string) => void;
  activeSortLabel: string;
}

export function ProductToolbar({
  heading,
  total,
  filters,
  onApply,
  activeCount,
  showFilter,
  onToggleFilter,
  sortBy,
  sortOpen,
  onToggleSort,
  onSelectSort,
  activeSortLabel,
}: ProductToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <span className="text-foreground font-body text-lg font-semibold uppercase md:text-xl">
        {heading} Styles ({total})
      </span>{" "}
      <div className="lg:hidden">
        <FilterDrawer
          filters={filters}
          onApply={onApply}
          activeCount={activeCount}
        />
      </div>
      <div className="relative hidden gap-5 lg:flex">
        <button
          onClick={onToggleFilter}
          className="border-brand-border bg-card font-body text-foreground hover:border-brand-orange/40 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors duration-150"
        >
          {showFilter ? "Hide" : "Show"} Filters
          <Settings2 size={20} strokeWidth={1.5} />
        </button>

        <button
          onClick={onToggleSort}
          className="border-brand-border bg-card font-body text-foreground hover:border-brand-orange/40 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors duration-150"
        >
          <span className="text-muted-foreground hidden sm:inline">Sort: </span>
          <span className="font-semibold">{activeSortLabel}</span>
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
            <div className="fixed inset-0 z-10" onClick={onToggleSort} />
            <div className="border-brand-border bg-card animate-fade-in-up absolute top-full right-0 z-20 mt-2 w-52 rounded-2xl border p-1.5 shadow-(--shadow-card)">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSelectSort(opt.value)}
                  className={cn(
                    "font-body flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-colors duration-150",
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
  );
}
