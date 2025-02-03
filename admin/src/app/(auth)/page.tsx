import GoogleLogin from "@/components/auth/GoogleLogin";
import LoginForm from "@/components/auth/LoginForm";
import AuthLayout from "@/components/layout/AuthLayout";
import { Separator } from "@/components/ui/separator";

export default function page() {
  return (
    <AuthLayout
      title="Login to your account"
      description="Enter your email and password to login"
    >
      <LoginForm />
      <Separator className="my-8" />
      <GoogleLogin />
    </AuthLayout>
  );
}
