import useAuthStore from "@/store/userStore";
import { Navigate, Outlet } from "react-router";

export default function ProtectedRoute() {
  const { token } = useAuthStore();

  if (!token) return <Navigate to="/" replace />;

  return <Outlet />;
}
