import { Star } from "lucide-react";

export default function StarInput({
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
