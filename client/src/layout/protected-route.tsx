import { Navigate, Outlet } from "react-router";

import useAuthStore from "@/store/userStore";

export default function ProtectedRoute() {
  const { token } = useAuthStore();

  if (!token) return <Navigate to="/" replace />;

  return <Outlet />;
}
