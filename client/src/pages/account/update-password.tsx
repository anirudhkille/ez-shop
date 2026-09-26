import AuthLayout from "@/layout/auth-layout";
import Head from "@/layout/head";

import UpdatePasswordForm from "@/features/auth/update-password-form";

export default function UpdatePassword() {
  return (
    <>
      <Head
        title="Update Password | EZ Shop"
        description="Change your EZ Shop password. Enter your current password to choose a new one."
      />
      <AuthLayout
        title="Update password"
        description="Choose a new password for your account."
        question="Remembered it?"
        redirect="/account"
        redirectText="Back to account"
        flush
      >
        <UpdatePasswordForm />
      </AuthLayout>
    </>
  );
}
