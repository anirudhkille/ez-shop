export const PROFILE_VIEWS = ["overview", "orders", "saved"] as const;

export type ProfileView = (typeof PROFILE_VIEWS)[0];

export type TProfileOrder = {
  _id: string;
  createdAt: string;
  orderStatus?: string;
  products?: unknown[];
  totalAmount: number;
};

export const isProfileView = (value: string | null): value is ProfileView =>
  PROFILE_VIEWS.some((view) => view === value);
