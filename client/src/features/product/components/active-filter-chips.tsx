import { X } from "lucide-react";

import type { FilterChip } from "../hooks/use-product-filters";

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
}

export default function ActiveFilterChips({
  chips,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="animate-fade-in-up mb-5 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.label}
          className="border-brand-orange/40 bg-brand-orange/10 font-body text-brand-orange flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
        >
          {chip.label}
          <button
            onClick={chip.remove}
            aria-label={`Remove ${chip.label} filter`}
            className="transition-colors hover:text-white"
          >
            <X size={11} />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="border-brand-border font-body text-muted-foreground hover:border-brand-orange/40 hover:text-foreground rounded-full border px-3 py-1 text-xs transition-colors duration-150"
      >
        Clear all
      </button>
    </div>
  );
}
