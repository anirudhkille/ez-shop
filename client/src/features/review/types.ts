export interface TReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  firstName: string;
  lastInitial?: string;
}

export interface TPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TReviewDraft {
  rating: number;
  comment?: string;
}
