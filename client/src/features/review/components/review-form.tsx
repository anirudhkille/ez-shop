import { useState } from "react";

import { Trash2 } from "lucide-react";

import { StarInput } from "./star-input";

interface ReviewFormProps {
  initialRating: number;
  initialComment: string;
  isExisting: boolean;
  submitting: boolean;
  onSubmit: (draft: { rating: number; comment?: string }) => void;
  onDelete?: () => void;
}

export function ReviewForm({
  initialRating,
  initialComment,
  isExisting,
  submitting,
  onSubmit,
  onDelete,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [touched, setTouched] = useState(isExisting);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);

    if (!rating) return;

    onSubmit({ rating, comment: comment.trim() || undefined });
  };

  const showRatingError = touched && !rating;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="font-body text-foreground text-sm font-semibold">
          Your rating
        </span>
        <div className="mt-2 flex items-center gap-3">
          <StarInput value={rating} onChange={setRating} />
          {showRatingError && (
            <span className="font-body text-destructive text-xs">
              Pick a rating
            </span>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="font-body text-foreground text-sm font-semibold"
        >
          Your review
          <span className="text-muted-foreground ml-1.5 text-xs font-normal">
            optional
          </span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="How was the fit, quality, delivery?"
          className="border-brand-border bg-background text-foreground placeholder:text-muted-foreground focus:border-brand-orange mt-2 w-full resize-y rounded-xl border px-4 py-3 text-sm focus:outline-none"
        />
        <span className="font-body text-muted-foreground mt-1 block text-right text-xs">
          {comment.length}/1000
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-brand-orange text-primary-foreground font-body rounded-xl px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity duration-200 disabled:opacity-50"
        >
          {submitting
            ? "Submitting..."
            : isExisting
              ? "Update review"
              : "Publish review"}
        </button>

        {isExisting && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="font-body text-muted-foreground inline-flex items-center gap-1.5 text-sm transition-colors hover:text-red-400"
          >
            <Trash2 size={14} />
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
