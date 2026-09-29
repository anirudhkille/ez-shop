import useUserStore from "@/features/auth/store/userStore";

import {
  useDeleteReview,
  useMyReview,
  useReviews,
  useSubmitReview,
} from "../hooks/useReviews";
import { ReviewForm } from "./review-form";
import { ReviewList, ReviewLoginPrompt } from "./review-list";

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
  const { data: mine } = useMyReview(productId);
  const submit = useSubmitReview(productId);
  const remove = useDeleteReview(productId);

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
          {token ? (
            <ReviewForm
              key={mine?.id ?? "new"}
              initialRating={mine?.rating ?? 0}
              initialComment={mine?.comment ?? ""}
              isExisting={!!mine}
              submitting={submit.isPending}
              onSubmit={(draft) => submit.mutate(draft)}
              onDelete={mine ? () => remove.mutate(mine.id) : undefined}
            />
          ) : (
            <ReviewLoginPrompt />
          )}
        </div>
      </div>
    </section>
  );
}
