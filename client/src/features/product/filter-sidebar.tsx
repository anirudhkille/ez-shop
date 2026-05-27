import { useState } from "react";

import { ChevronDown, Star, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { useCategorys } from "@/hooks/useCategory";

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  minRating: number;
}

export const defaultFilters: FilterState = {
  categories: [],
  priceRange: [0, 20000],
  sizes: [],
  colors: [],
  minRating: 0,
};

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  activeCount: number;
  className?: string;
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "7", "8", "9", "10", "11", "12"];
const ALL_COLORS = [
  { label: "Black", hex: "#111111" },
  { label: "White", hex: "#f5f5f5" },
  { label: "Orange", hex: "#ff6600" },
  { label: "Navy", hex: "#1a237e" },
  { label: "Blue", hex: "#3ab4f2" },
  { label: "Red", hex: "#cc1111" },
];

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-brand-border border-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-display text-foreground text-sm font-bold tracking-widest uppercase">
          {title}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          open ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onChange,
  onClear,
  activeCount,
  className,
}: FilterSidebarProps) {
  const { data: categories } = useCategorys();
  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

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

      <CollapsibleSection title="Category">
        <div className="space-y-1">
          {categories?.map((cat: any) => {
            const active = filters.categories.includes(cat._id);

            return (
              <button
                key={cat._id}
                onClick={() =>
                  onChange({
                    ...filters,
                    categories: toggle(filters.categories, cat._id),
                  })
                }
                className={cn(
                  "font-body flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm capitalize transition-all duration-150",
                  active
                    ? "bg-brand-orange/10 text-brand-orange"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat.name}
                {active && (
                  <div className="bg-brand-orange h-1.5 w-1.5 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Price Range">
        <div className="space-y-3 px-1">
          <div className="font-body flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              ₹{filters.priceRange[0]}
            </span>
            <span className="text-foreground font-semibold">
              ₹{filters.priceRange[1]}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={20000}
            step={500}
            value={filters.priceRange[1]}
            onChange={(e) =>
              onChange({
                ...filters,
                priceRange: [filters.priceRange[0], Number(e.target.value)],
              })
            }
            className="accent-brand-orange w-full cursor-pointer"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Size" defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SIZES.map((size) => {
            const active = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() =>
                  onChange({ ...filters, sizes: toggle(filters.sizes, size) })
                }
                className={cn(
                  "font-body rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-150",
                  active
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-brand-border text-muted-foreground hover:border-brand-orange/50 hover:text-foreground"
                )}
              >
                {size}
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Color" defaultOpen={false}>
        <div className="flex flex-wrap gap-3 px-1">
          {ALL_COLORS.map(({ label, hex }) => {
            const active = filters.colors.includes(label);
            return (
              <button
                key={label}
                onClick={() =>
                  onChange({
                    ...filters,
                    colors: toggle(filters.colors, label),
                  })
                }
                title={label}
                className="group flex flex-col items-center gap-1.5"
              >
                <div
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all duration-150",
                    active
                      ? "border-brand-orange scale-110 shadow-[0_0_0_2px_hsl(var(--brand-orange)/0.3)]"
                      : "border-brand-border group-hover:border-brand-orange/50 group-hover:scale-105"
                  )}
                  style={{ backgroundColor: hex }}
                />
                <span
                  className={cn(
                    "font-body text-[10px]",
                    active ? "text-brand-orange" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Min Rating" defaultOpen={false}>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() =>
                onChange({
                  ...filters,
                  minRating: filters.minRating === r ? 0 : r,
                })
              }
              className={cn(
                "font-body flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all",
                filters.minRating === r
                  ? "bg-brand-orange/10 text-brand-orange"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < r
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }
                  />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>
    </aside>
  );
}
