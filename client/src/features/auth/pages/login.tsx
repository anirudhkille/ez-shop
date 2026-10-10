import { useSearchParams } from "react-router";

import { Head } from "@/shared/components/head";
import { Divider } from "@/shared/components/ui/divider";

import { AuthLayout } from "../components/auth-layout";
import { GoogleLogin } from "../components/google-login";
import { LoginForm } from "../components/login-form";

export default function Login() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <>
      <Head
        title="Login | EZ Shop"
        description="Access your account on EZ Shop. Enter your email and password to login securely. If you don't have an account, you can sign up for one."
      />
      <AuthLayout
        title="Welcome back"
        description="Login to your EZ Shop account"
        redirect="/signup"
        question="Don't have an account?"
        redirectText="Create account"
      >
        {(error === "google" || error === "google_auth_failed") && (
          <p
            role="alert"
            className="font-body border-destructive/30 bg-destructive/10 text-destructive mb-3 rounded-lg border px-3 py-2.5 text-sm"
          >
            Google sign-in did not complete. Please try again, or use your email
            and password.
          </p>
        )}
        <GoogleLogin />
        <Divider />
        <LoginForm />
      </AuthLayout>
    </>
  );
}
