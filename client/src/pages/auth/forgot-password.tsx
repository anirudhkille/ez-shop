import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import ForgotPasswordForm from "@/features/auth/forgot-password-form";

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
