import { useState } from "react";
import type { ReactNode } from "react";

import { ChevronDown, Star } from "lucide-react";

import { useCategorys } from "@/features/category";
import { cn } from "@/shared/lib/utils";

import {
  ALL_COLORS,
  ALL_SIZES,
  PRICE_MAX,
  PRICE_MIN,
  PRICE_STEP,
  RATING_OPTIONS,
} from "../lib/constants";
import { type FilterState, toggleInList } from "../lib/filters";

export type FilterVariant = "drawer" | "sidebar";

const STAR_POSITIONS = [0, 1, 2, 3, 4];

interface SectionProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  variant: FilterVariant;
}

function FilterSection({
  title,
  isDrawer,
  initiallyOpen,
  children,
}: {
  title: string;
  isDrawer: boolean;
  initiallyOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(initiallyOpen);

  return (
    <div className="border-brand-border border-b">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between py-4",
          !isDrawer && "text-left"
        )}
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
          "overflow-hidden transition-[max-height,opacity] duration-200",
          open
            ? isDrawer
              ? "max-h-80 pb-4 opacity-100"
              : "max-h-96 pb-4 opacity-100"
            : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function CategoryFilter({ filters, onChange, variant }: SectionProps) {
  const { data: categories } = useCategorys();
  const isDrawer = variant === "drawer";

  return (
    <FilterSection title="Category" isDrawer={isDrawer} initiallyOpen>
      <div className={isDrawer ? "flex flex-wrap gap-2" : "space-y-1"}>
        {categories?.map((cat) => {
          const active = filters.categories.includes(cat._id);

          return (
            <button
              key={cat._id}
              onClick={() =>
                onChange({
                  ...filters,
                  categories: toggleInList(filters.categories, cat._id),
                })
              }
              className={cn(
                "font-body flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm capitalize transition-colors duration-150",
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
    </FilterSection>
  );
}

function PriceRangeFilter({ filters, onChange, variant }: SectionProps) {
  return (
    <FilterSection
      title="Price Range"
      isDrawer={variant === "drawer"}
      initiallyOpen
    >
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
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={filters.priceRange[1]}
          onChange={(e) =>
            onChange({
              ...filters,
              priceRange: [filters.priceRange[0], Number(e.target.value)],
            })
          }
          className={cn(
            "accent-brand-orange w-full",
            variant !== "drawer" && "cursor-pointer"
          )}
        />
      </div>
    </FilterSection>
  );
}

function SizeFilter({ filters, onChange, variant }: SectionProps) {
  const isDrawer = variant === "drawer";

  return (
    <FilterSection title="Size" isDrawer={isDrawer} initiallyOpen={isDrawer}>
      <div
        className={isDrawer ? "flex flex-wrap gap-2" : "flex flex-wrap gap-1.5"}
      >
        {ALL_SIZES.map((size) => {
          const active = filters.sizes.includes(size);

          return (
            <button
              key={size}
              onClick={() =>
                onChange({
                  ...filters,
                  sizes: toggleInList(filters.sizes, size),
                })
              }
              className={cn(
                "font-body rounded-lg border font-semibold transition-colors duration-150",
                isDrawer ? "px-3 py-2 text-sm" : "px-3 py-1.5 text-xs",
                active
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-brand-border text-muted-foreground",
                !active &&
                  (isDrawer
                    ? "hover:border-brand-orange/40"
                    : "hover:border-brand-orange/50 hover:text-foreground")
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}

function ColorFilter({ filters, onChange, variant }: SectionProps) {
  const isDrawer = variant === "drawer";

  return (
    <FilterSection title="Color" isDrawer={isDrawer} initiallyOpen={isDrawer}>
      <div
        className={
          isDrawer ? "flex flex-wrap gap-4" : "flex flex-wrap gap-3 px-1"
        }
      >
        {ALL_COLORS.map(({ label, hex }) => {
          const active = filters.colors.includes(label);

          return (
            <button
              key={label}
              onClick={() =>
                onChange({
                  ...filters,
                  colors: toggleInList(filters.colors, label),
                })
              }
              title={isDrawer ? undefined : label}
              className={
                isDrawer
                  ? "flex flex-col items-center gap-1.5"
                  : "group flex flex-col items-center gap-1.5"
              }
            >
              <div
                className={cn(
                  isDrawer
                    ? "h-9 w-9 rounded-full border-2 transition-colors duration-150"
                    : "h-7 w-7 rounded-full border-2 transition-[border-color,transform] duration-150",
                  active
                    ? isDrawer
                      ? "border-brand-orange scale-110 shadow-[0_0_0_3px_hsl(var(--brand-orange)/0.3)]"
                      : "border-brand-orange scale-110 shadow-[0_0_0_2px_hsl(var(--brand-orange)/0.3)]"
                    : isDrawer
                      ? "border-brand-border"
                      : "border-brand-border group-hover:border-brand-orange/50"
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
    </FilterSection>
  );
}

function RatingFilter({ filters, onChange, variant }: SectionProps) {
  const isDrawer = variant === "drawer";

  return (
    <FilterSection
      title="Min Rating"
      isDrawer={isDrawer}
      initiallyOpen={isDrawer}
    >
      <div className={isDrawer ? "flex flex-wrap gap-2" : "space-y-1"}>
        {RATING_OPTIONS.map((r) => (
          <button
            key={r}
            onClick={() =>
              onChange({
                ...filters,
                minRating: filters.minRating === r ? 0 : r,
              })
            }
            className={cn(
              isDrawer
                ? "font-body flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors duration-150"
                : "font-body flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
              filters.minRating === r
                ? isDrawer
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "bg-brand-orange/10 text-brand-orange"
                : "border-brand-border text-muted-foreground"
            )}
          >
            <div className="flex gap-0.5">
              {STAR_POSITIONS.map((i) => (
                <Star
                  key={i}
                  size={isDrawer ? 11 : 12}
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
    </FilterSection>
  );
}

export function FilterSections({ filters, onChange, variant }: SectionProps) {
  return (
    <>
      <CategoryFilter filters={filters} onChange={onChange} variant={variant} />
      <PriceRangeFilter
        filters={filters}
        onChange={onChange}
        variant={variant}
      />
      <SizeFilter filters={filters} onChange={onChange} variant={variant} />
      <ColorFilter filters={filters} onChange={onChange} variant={variant} />
      <RatingFilter filters={filters} onChange={onChange} variant={variant} />
    </>
  );
}
