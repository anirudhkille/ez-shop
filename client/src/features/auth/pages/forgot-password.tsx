import Head from "@/shared/components/head";

import AuthLayout from "../components/auth-layout";
import ForgotPasswordForm from "../components/forgot-password-form";

export default function ForgotPassword() {
  return (
    <>
      <Head
        title="Forgot Password | EZ Shop"
        description="Trouble logging in? Enter your email to reset your password and regain access to your EZ Shop account."
      />

      <AuthLayout
        title="Forgot password"
        description="Enter your email address below and we'll send you otp to reset your password"
        question="Remember your password? "
        redirectText="Login"
        redirect="/login"
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </>
  );
}
