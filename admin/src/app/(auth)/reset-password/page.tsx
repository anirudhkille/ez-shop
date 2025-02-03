import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import AuthLayout from "@/components/layout/AuthLayout";

export default function page() {
  return (
    <AuthLayout
      title="Forgot password"
      description="Enter your email address below and we'll send you a link to reset your password"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
