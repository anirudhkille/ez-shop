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
        title="Login to your account"
        description="Enter your email and password to login"
        redirect="/signup"
        redirectText="Don't have an account? Sign Up"
      >
        <LoginForm />
        <GoogleLogin />
      </AuthLayout>
    </>
  );
}
