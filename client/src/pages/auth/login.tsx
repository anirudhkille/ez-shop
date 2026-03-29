import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import GoogleLogin from "@/features/auth/google-login";
import LoginForm from "@/features/auth/login-form";

export default function Login() {
  return (
    <>
      <Head
        title="Login | EZ Shop"
        description="Access your account on EZ Shop. Enter your email and password to login securely. If you don't have an account, you can sign up for one."
      />
      <AuthLayout
        title="Welcome back"
        description="Log in to your EZ Shop account"
        redirect="/signup"
        question="Don't have an account?"
        redirectText="Create account"
      >
        <GoogleLogin />
        <div className="my-6 flex items-center gap-3">
          <div className="bg-brand-border h-px flex-1" />
          <span className="font-body text-muted-foreground text-xs tracking-widest uppercase">
            or
          </span>
          <div className="bg-brand-border h-px flex-1" />
        </div>
        <LoginForm />
      </AuthLayout>
    </>
  );
}
