import Head from "@/shared/components/head";

import AuthLayout from "../components/auth-layout";
import ResetPasswordForm from "../components/reset-password-form";

export default function TResetPassword() {
  return (
    <>
      <Head
        title="Reset Password | EZ Shop"
        description="Reset your EZ Shop password securely. Enter your new password to update your account and regain access."
      />
      <AuthLayout
        title="Reset password"
        description="Enter a new password for your account."
        question="Remember your password? "
        redirectText="Login"
        redirect="/login"
      >
        <ResetPasswordForm />
      </AuthLayout>
    </>
  );
}
