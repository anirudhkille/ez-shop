import { Navigate, Outlet } from "react-router";

import useAuthStore from "@/store/userStore";

const RedirectIfAuthenticated = () => {
  const { token } = useAuthStore();

  if (token) return <Navigate to="/" />;

  return <Outlet />;
};

export default RedirectIfAuthenticated;
