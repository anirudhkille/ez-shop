import { useEffect, useState } from "react";

import { Link, useNavigate, useSearchParams } from "react-router";

import useUserStore from "../store/userStore";

const TIMEOUT_MS = 12_000;

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

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

  if (timedOut) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="font-display text-foreground text-3xl font-black uppercase">
            Sign-in took too long
          </h1>
          <p className="font-body text-muted-foreground">
            Google did not return a session. This usually means the popup was
            closed or the request was blocked.
          </p>
          <Link
            to="/login"
            className="bg-brand-orange text-primary-foreground font-body inline-block rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase"
          >
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="font-display text-foreground text-3xl font-black uppercase">
          Signing you in
        </h1>
        <p className="font-body text-muted-foreground">
          Finishing with Google…
        </p>
        <Link
          to="/login"
          className="font-body text-muted-foreground hover:text-brand-orange inline-block text-sm underline-offset-4 hover:underline"
        >
          Cancel
        </Link>
      </div>
    </main>
  );
}
