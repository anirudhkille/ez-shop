import LoginForm from "@/features/auth/LoginForm";
import AuthLayout from "@/components/layout/AuthLayout";

export const metadata = {
  title: "Login | EZ Shop Admin",
};

export default function page() {
  return (
    <AuthLayout
      title="Login to your account"
      description="Enter your email and password to login"
    >
      <LoginForm />
    </AuthLayout>
  );
}
