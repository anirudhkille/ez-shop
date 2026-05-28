import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import VerifyEmailForm from "@/features/auth/verify-email";

export default function VerifyEmail() {
  return (
    <>
      <Head
        title="Verify Your Email | EZ Shop"
        description="Enter the OTP sent to your email to verify your account and complete signup on EZ Shop."
      />

      <AuthLayout
        title="Verify your email"
        description="We've sent a verification code to your email. Enter it below to continue."
        redirect="/signup"
        question="Didn't receive the code? "
        redirectText="Resend OTP"
      >
        <VerifyEmailForm />
      </AuthLayout>
    </>
  );
}
