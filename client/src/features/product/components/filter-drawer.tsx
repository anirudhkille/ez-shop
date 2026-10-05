import { useState } from "react";

import { SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import { defaultFilters, type FilterState } from "../lib/filters";
import { FilterSections } from "./filter-sections";

interface FilterDrawerProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  activeCount: number;
}

export function FilterDrawer({
  filters,
  onApply,
  activeCount,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(filters);
  const draftActiveCount =
    draft.categories.length +
    draft.sizes.length +
    draft.colors.length +
    (draft.minRating > 0 ? 1 : 0) +
    (draft.priceRange[1] < 20000 ? 1 : 0);

  const handleOpen = () => {
    setDraft(filters);
    setOpen(true);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="border-brand-border bg-card font-body text-foreground hover:border-brand-orange/50 relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors duration-150"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="bg-brand-orange font-body absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "bg-card fixed right-0 bottom-0 left-0 z-50 flex max-h-[90dvh] flex-col rounded-t-3xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        <div className="border-brand-border flex items-center justify-between border-b px-6 pt-2 pb-4">
          <span className="font-display text-foreground text-lg font-bold tracking-widest uppercase">
            Filters
          </span>
          <button
            onClick={() => setOpen(false)}
            className="bg-muted text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="scrollbar-hide flex-1 px-6">
          <FilterSections
            filters={draft}
            onChange={setDraft}
            variant="drawer"
          />
          <div className="h-4" />
        </div>

        <div className="border-brand-border pb-safe flex gap-3 border-t p-4">
          <button
            onClick={() => setDraft(defaultFilters)}
            className="border-brand-border font-body text-muted-foreground hover:text-foreground hover:border-brand-foreground flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors duration-150"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="bg-brand-orange font-body flex-2 rounded-xl py-3 text-sm font-semibold text-white transition-[background-color,opacity,transform] duration-150 hover:opacity-90 active:scale-[0.98]"
          >
            Apply Filters
            {draftActiveCount > 0 ? ` (${draftActiveCount})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
