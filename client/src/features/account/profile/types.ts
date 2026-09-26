/**
 * The account area is route-driven: each panel is a child route of `/account`
 * (see App.tsx). `/account` itself renders the overview panel via `<Outlet />`.
 */
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
