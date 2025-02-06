import ForgotPasswordForm from "@/features/auth/ForgotPasswordForm";
import AuthLayout from "@/components/layout/AuthLayout";

export const metadata = {
  title: "Forgot Password | EZ Shop Admin",
};

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
