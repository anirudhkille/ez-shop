export type TAddress = {
  _id?: string;
  label: "Home" | "Work" | "Other";
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  zipCode: string;
  state: string;
  city: string;
  country: string;
  isDefault: boolean;
};

/** Each panel is a child route of `/account`; see App.tsx. */
export const PROFILE_VIEWS = [
  "overview",
  "orders",
  "saved",
  "settings",
] as const;

export type ProfileView = (typeof PROFILE_VIEWS)[number];

/** Absolute path for a view. The overview panel is the `/account` index. */
export const profileViewPath = (view: ProfileView): string =>
  view === "overview" ? "/account" : `/account/${view}`;
