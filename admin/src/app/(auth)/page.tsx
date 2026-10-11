import AuthLayout from "@/components/layout/auth-layout";

import LoginForm from "@/features/auth/login-form";

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
