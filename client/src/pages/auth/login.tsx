import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import GoogleLogin from "@/features/auth/google-login";
import LoginForm from "@/features/auth/login-form";
import Divider from "@/shared/components/ui/divider";

export default function Login() {
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
        <GoogleLogin />
        <Divider />
        <LoginForm />
      </AuthLayout>
    </>
  );
}
