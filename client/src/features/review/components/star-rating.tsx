import { Star } from "lucide-react";

import { formatRating } from "@/shared/lib/formatRating";

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export function StarRating({ rating, size = 14, showValue }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, rating || 0));

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={size}
              className="text-muted-foreground/25"
              strokeWidth={1.5}
            />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${(clamped / 5) * 100}%` }}
        >
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={size}
              className="shrink-0 fill-amber-400 text-amber-400"
              strokeWidth={1.5}
            />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="font-body text-foreground text-sm font-semibold">
          {formatRating(clamped)}
        </span>
      )}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star === 1 ? "" : "s"}`}
          aria-pressed={value === star}
          className="focus-visible:ring-brand-orange rounded transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Star
            size={26}
            strokeWidth={1.5}
            className={
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }
          />
        </button>
      ))}
    </span>
  );
}
