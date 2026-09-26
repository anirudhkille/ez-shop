import Head from "@/shared/components/head";
import Divider from "@/shared/components/ui/divider";

import AuthLayout from "../components/auth-layout";
import GoogleLogin from "../components/google-login";
import LoginForm from "../components/login-form";

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
