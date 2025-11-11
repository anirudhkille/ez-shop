import useAuthStore from "@/store/userStore";
import { Navigate, Outlet } from "react-router";

const RedirectIfAuthenticated = () => {
  const { token } = useAuthStore();

  if (token) return <Navigate to="/" />;

  return <Outlet />;
};

export default RedirectIfAuthenticated;
