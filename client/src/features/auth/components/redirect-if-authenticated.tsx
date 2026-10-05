import { Navigate, Outlet } from "react-router";

import { useUserStore } from "../store/user-store";

export const RedirectIfAuthenticated = () => {
  const { token } = useUserStore();

  if (token) return <Navigate to="/" />;

  return <Outlet />;
};
