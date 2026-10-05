import { useUserStore } from "@/features/auth";

import {
  useDeleteReview,
  useMyReview,
  useReviews,
  useSubmitReview,
} from "../hooks/use-reviews";
import { ReviewForm } from "./review-form";
import {
  ReviewList,
  ReviewLoginPrompt,
  ReviewNotEligible,
} from "./review-list";

interface ReviewSectionProps {
  productId: string;
  rating: number;
  reviewsCount: number;
}

export function ReviewSection({
  productId,
  rating,
  reviewsCount,
}: ReviewSectionProps) {
  const { token } = useUserStore();
  const { data, isLoading } = useReviews(productId);
  const { data: mine, isLoading: mineLoading } = useMyReview(productId);
  const submit = useSubmitReview(productId);
  const remove = useDeleteReview(productId);

  const renderPanel = () => {
    if (!token) return <ReviewLoginPrompt />;

    if (mineLoading) {
      return (
        <div className="space-y-3">
          <div className="bg-brand-surface-raised h-8 w-32 animate-pulse rounded-full" />
          <div className="bg-brand-surface-raised h-24 w-full animate-pulse rounded-xl" />
        </div>
      );
    }

    if (!mine?.canReview) return <ReviewNotEligible />;

    return (
      <ReviewForm
        key={mine.review?.id ?? "new"}
        initialRating={mine.review?.rating ?? 0}
        initialComment={mine.review?.comment ?? ""}
        isExisting={!!mine.review}
        submitting={submit.isPending}
        onSubmit={(draft) => submit.mutate(draft)}
        onDelete={
          mine.review ? () => remove.mutate(mine.review!.id) : undefined
        }
      />
    );
  };

  return (
    <section id="reviews" className="mx-auto max-w-350 px-6 py-20 lg:px-10">
      <div className="mb-10">
        <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
          Customer feedback
        </span>
        <h2 className="font-display text-foreground mt-1 text-4xl font-black uppercase lg:text-5xl">
          Reviews
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
        <ReviewList
          reviews={data?.reviews ?? []}
          average={rating}
          count={reviewsCount}
          loading={isLoading}
        />

        <div className="border-brand-border/60 border-t pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-20">
          {renderPanel()}
        </div>
      </div>
    </section>
  );
}
