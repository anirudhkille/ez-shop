import { Star } from "lucide-react";

import { formatRating } from "@/shared/lib/formatRating";

interface StarRatingProps {
  rating: number;
  size?: number;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  size = 14,
  showValue,
}: StarRatingProps) {
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
