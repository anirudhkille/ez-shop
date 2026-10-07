import { useEffect } from "react";

import { useNavigate, useSearchParams } from "react-router";

import { useUserStore } from "../store/user-store";

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  useEffect(() => {
    const token = searchParams.get("accessToken");
    if (token) {
      setUser({
        token,
        name: searchParams.get("name"),
        email: searchParams.get("email"),
      });
      navigate("/", { replace: true });
      return;
    }

    navigate("/login?error=google", { replace: true });
  }, [searchParams, setUser, navigate]);

  return null;
}
