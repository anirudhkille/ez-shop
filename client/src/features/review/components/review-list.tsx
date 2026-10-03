import { Link } from "react-router";

import StarRating from "@/shared/components/star-rating";
import { formatRating, reviewCountLabel } from "@/shared/lib/formatRating";

import type { TReview } from "../types";

const timeAgo = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;

  return `${Math.floor(days / 365)} yr ago`;
};

export function ReviewList({
  reviews,
  average,
  count,
  loading,
}: {
  reviews: TReview[];
  average: number;
  count: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border-brand-border/60 border-b pb-4">
            <div className="bg-brand-surface-raised h-3 w-32 animate-pulse rounded-full" />
            <div className="bg-brand-surface-raised mt-3 h-3 w-full animate-pulse rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (count === 0) {
    return (
      <p className="font-body text-muted-foreground py-6 text-sm">
        No reviews yet. Be the first to share your experience.
      </p>
    );
  }

  return (
    <div>
      <div className="border-brand-border/60 mb-5 flex items-center gap-3 border-b pb-4">
        <span className="font-display text-foreground text-4xl font-black">
          {formatRating(average)}
        </span>
        <div>
          <StarRating rating={average} size={16} />
          <p className="font-body text-muted-foreground mt-0.5 text-xs">
            {reviewCountLabel(count)}
          </p>
        </div>
      </div>

      <ul className="space-y-5">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border-brand-border/60 border-b pb-5 last:border-0"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <StarRating rating={review.rating} size={13} />
              <span className="font-body text-foreground text-sm font-semibold">
                {review.firstName} {review.lastInitial}
              </span>
              <span className="border-brand-orange/40 text-brand-orange rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                Verified purchase
              </span>
              <span className="font-body text-muted-foreground ml-auto text-xs">
                {timeAgo(review.createdAt)}
              </span>
            </div>
            {review.comment && (
              <p className="font-body text-muted-foreground mt-2 text-sm leading-relaxed">
                {review.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewLoginPrompt() {
  return (
    <p className="font-body text-muted-foreground text-sm">
      <Link
        to="/login"
        className="text-brand-orange font-semibold hover:underline"
      >
        Log in
      </Link>{" "}
      to write a review.
    </p>
  );
}

export function ReviewNotEligible() {
  return (
    <div className="border-brand-border/60 rounded-2xl border border-dashed p-6">
      <h3 className="font-body text-foreground text-sm font-semibold">
        Reviews are for verified buyers
      </h3>
      <p className="font-body text-muted-foreground mt-1.5 text-sm leading-relaxed">
        You need an order containing this product before you can review it. This
        keeps ratings tied to people who actually bought it.
      </p>
      <Link
        to="/products"
        className="font-body text-brand-orange hover:text-brand-orange/80 mt-4 inline-block text-sm font-semibold hover:underline"
      >
        Continue shopping
      </Link>
    </div>
  );
}
