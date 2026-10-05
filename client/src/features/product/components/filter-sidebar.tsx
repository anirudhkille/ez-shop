import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { FilterState } from "../lib/filters";
import { FilterSections } from "./filter-sections";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  activeCount: number;
  className?: string;
}

export function FilterSidebar({
  filters,
  onChange,
  onClear,
  activeCount,
  className,
}: FilterSidebarProps) {
  return (
    <aside className={cn("w-64 shrink-0", className)}>
      <div className="border-brand-border flex items-center justify-between border-b pb-4">
        <span className="font-display text-foreground text-base font-bold tracking-widest uppercase">
          Filters
          {activeCount > 0 && (
            <span className="bg-brand-orange ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="font-body text-muted-foreground hover:text-brand-orange flex items-center gap-1 text-xs transition-colors"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      <FilterSections filters={filters} onChange={onChange} variant="sidebar" />
    </aside>
  );
}
