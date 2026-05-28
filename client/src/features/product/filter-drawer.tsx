import { useState } from "react";

import { ChevronDown, SlidersHorizontal, Star, X } from "lucide-react";

import { cn } from "@/lib/utils";

import { useCategorys } from "@/hooks/useCategory";

import { defaultFilters, type FilterState } from "./filter-sidebar";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "7", "8", "9", "10", "11", "12"];
const ALL_COLORS = [
  { label: "Black", hex: "#111111" },
  { label: "White", hex: "#f5f5f5" },
  { label: "Orange", hex: "#ff6600" },
  { label: "Navy", hex: "#1a237e" },
  { label: "Blue", hex: "#3ab4f2" },
  { label: "Red", hex: "#cc1111" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-brand-border border-b">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4"
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
          open ? "max-h-80 pb-4 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface FilterDrawerProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  activeCount: number;
}

export default function FilterDrawer({
  filters,
  onApply,
  activeCount,
}: FilterDrawerProps) {
  const { data: categories } = useCategorys();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(filters);
  const draftActiveCount =
    draft.categories.length +
    draft.sizes.length +
    draft.colors.length +
    (draft.minRating > 0 ? 1 : 0) +
    (draft.priceRange[1] < 20000 ? 1 : 0);

  const toggle = <T,>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const handleOpen = () => {
    setDraft(filters);
    setOpen(true);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const handleClear = () => {
    setDraft(defaultFilters);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        className="border-brand-border bg-card font-body text-foreground hover:border-brand-orange/50 relative flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all"
      >
        <SlidersHorizontal size={15} />
        Filters
        {activeCount > 0 && (
          <span className="bg-brand-orange font-body absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "bg-card fixed right-0 bottom-0 left-0 z-50 flex max-h-[90dvh] flex-col rounded-t-3xl transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6">
          {/* Category */}
          <Section title="Category">
            <div className="flex flex-wrap gap-2">
              {categories?.map((cat: any) => {
                const active = draft.categories.includes(cat._id);

                return (
                  <button
                    key={cat._id}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        categories: toggle(draft.categories, cat._id),
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
          </Section>

          <Section title="Price Range">
            <div className="space-y-3 px-1">
              <div className="font-body flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  ₹{draft.priceRange[0]}
                </span>
                <span className="text-foreground font-semibold">
                  ₹{draft.priceRange[1]}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20000}
                step={500}
                value={draft.priceRange[1]}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    priceRange: [draft.priceRange[0], Number(e.target.value)],
                  })
                }
                className="accent-brand-orange w-full"
              />
            </div>
          </Section>

          {/* Size */}
          <Section title="Size">
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => {
                const active = draft.sizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() =>
                      setDraft({ ...draft, sizes: toggle(draft.sizes, size) })
                    }
                    className={cn(
                      "font-body rounded-lg border px-3 py-2 text-sm font-semibold transition-all",
                      active
                        ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                        : "border-brand-border text-muted-foreground hover:border-brand-orange/40"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Color */}
          <Section title="Color">
            <div className="flex flex-wrap gap-4">
              {ALL_COLORS.map(({ label, hex }) => {
                const active = draft.colors.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        colors: toggle(draft.colors, label),
                      })
                    }
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-all",
                        active
                          ? "border-brand-orange scale-110 shadow-[0_0_0_3px_hsl(var(--brand-orange)/0.3)]"
                          : "border-brand-border"
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
          </Section>

          {/* Rating */}
          <Section title="Min Rating">
            <div className="flex flex-wrap gap-2">
              {[4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      minRating: draft.minRating === r ? 0 : r,
                    })
                  }
                  className={cn(
                    "font-body flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                    draft.minRating === r
                      ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                      : "border-brand-border text-muted-foreground"
                  )}
                >
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={
                          i < r
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }
                      />
                    ))}
                  </div>
                  & up
                </button>
              ))}
            </div>
          </Section>

          <div className="h-4" />
        </div>

        {/* Footer CTA */}
        <div className="border-brand-border pb-safe flex gap-3 border-t p-4">
          <button
            onClick={handleClear}
            className="border-brand-border font-body text-muted-foreground hover:border-foreground hover:text-foreground flex-1 rounded-xl border py-3 text-sm font-semibold transition-all"
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            className="bg-brand-orange font-body flex-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Apply Filters{draftActiveCount > 0 ? ` (${draftActiveCount})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
