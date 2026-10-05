import { Navigate, Outlet } from "react-router";

import { useUserStore } from "../store/user-store";

export function ProtectedRoute() {
  const { token } = useUserStore();

  if (!token) return <Navigate to="/" replace />;

  return <Outlet />;
}
