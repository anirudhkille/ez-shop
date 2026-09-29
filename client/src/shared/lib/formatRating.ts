export const formatRating = (rating: number | null | undefined): string => {
  if (rating == null || Number.isNaN(rating)) return "—";

  const rounded = Math.round(rating * 10) / 10;

  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

export const reviewCountLabel = (count: number | null | undefined): string => {
  if (!count) return "No reviews yet";

  return `${count} ${count === 1 ? "review" : "reviews"}`;
};
