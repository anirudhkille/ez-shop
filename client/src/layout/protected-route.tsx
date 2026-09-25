import { Navigate, Outlet } from "react-router";

import useAuthStore from "@/store/userStore";

export default function ProtectedRoute() {
  const { token } = useAuthStore();
  console.log(token);

  if (!token) return <Navigate to="/" replace />;

  return <Outlet />;
}
